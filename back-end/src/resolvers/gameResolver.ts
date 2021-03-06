import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  Root,
  Subscription,
  UseMiddleware,
  Int,
} from "type-graphql";
import { getConnection } from "typeorm";
import { v4 } from "uuid";
import { Game, messageType } from "../entites/Game";
import { User } from "../entites/User";
import { MyContext } from "../types";
import { isAuth } from "../utils/isAuth";
import fetch from 'cross-fetch';
require('dotenv').config();

const GAME_INFO = "GAME_BOARD";

const boardToString = <T>(arr: T[]) => {
  let stringedArr = "";
  for (let i = 0; i < arr.length; i++) {
    if (i === arr.length - 1) {
      stringedArr = stringedArr + `[${arr[i]}]`;
      continue;
    }
    stringedArr = stringedArr + `[${arr[i]}],`;
  }
  return stringedArr;
};

export const messagesToString = <T extends messageType>(arr: T[]) => {
  let stringedArr = "";
  for (let i = 0; i < arr.length; i++) {
    if (i === arr.length - 1) {
      stringedArr = stringedArr + `['${arr[i][0]}', '${arr[i][1]}']`;
      continue;
    }
    stringedArr = stringedArr + `['${arr[i][0]}', '${arr[i][1]}'],`;
  }
  return stringedArr;
};

@Resolver(Game)
export class gameResolver {
  @Query(() => String)
  ping() {
    return "pong";
  }

  @FieldResolver(() => User)
  user1(@Root() game: Game) {
    return User.findOne(game.user1Id);
  }

  @FieldResolver(() => User, { nullable: true })
  user2(@Root() game: Game) {
    if (!game.user2Id) return null;
    if (game.user2) return game.user2;
    return User.findOne(game.user2Id);
  }

  @Mutation(() => User, { nullable: true })
  async createUser(@Arg("username") username: string, @Ctx() { req }: MyContext): Promise<User | null> {
    const user = new User();
    user.nickname = username;

    if (username.length < 4) {
      throw new Error("Your nickname must be greater than 3 characters long!");
    }

    try {
      const savedUser = await User.save(user);
      req.session.userId = savedUser.id;
    } catch (err) {
      return null;
    }

    return user;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<User | null> {
    const user = await User.findOne(req.session.userId);

    if (!user) {
      return null;
    }

    return user;
  }

  @Mutation(() => Game, { nullable: true })
  @UseMiddleware(isAuth)
  async createGame(
    @Ctx() { req }: MyContext,
    //@ts-ignore
    @Arg("googleCaptchaToken") captchaToken: string,
    @PubSub() pubsub: PubSubEngine
  ): Promise<Game | null> {
     const secret = process.env.RECAPTCHA_SECRET_KEY;

     const grc = await fetch(
       `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${captchaToken}`,
       { method: "POST" }
     );

     const datares = await grc.json()

     if (!datares.success) {
       throw new Error("Beep boop ;)");
     }

    let game = new Game();
    // GameBoard: 0 means empty, 1 means player1/creator, 2 means joiner of game
    game.gameBoard = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ]; // 7 by 6

    const user1 = await User.findOne(req.session.userId);

    if (!user1) {
      throw new Error("Oh no! Something has gone terribly wrong, but how!?!?");
    }

    game.user1 = user1;
    game.whoseMove = user1.id;
    game.messages = [[user1.nickname.toUpperCase(), "has joined the game!"]];

    const savedGame = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Game)
      .values({
        user1: game.user1,
        whoseMove: game.user1.id,
        messages: () => `ARRAY[${messagesToString(game.messages)}]`,
        gameBoard: () => `ARRAY[${boardToString(game.gameBoard)}]`,
        gameUUID: v4(),
      })
      .returning("*")
      .execute();

    game.id = savedGame.raw[0].id;

    // const savedGame = await Game.save(game);

    const mygame = (await Game.findOne(game.id)) as Game;

    const payload = game;
    await pubsub.publish(String(game.id), payload);

    return mygame;
  }

  @Mutation(() => Game, { nullable: true })
  @UseMiddleware(isAuth)
  async joinGame(
    @Ctx() { req }: MyContext,
    @Arg("gameId") gameId: string,
    @PubSub() pubsub: PubSubEngine
  ): Promise<Game | null> {
    let game = await Game.findOne({ gameUUID: gameId });

    if (!game) {
      return null;
    }

    if (req.session.userId === game.user1Id) {
      throw new Error("Trying to join own game");
    }

    if (game.user2) {
      throw new Error("Game full");
    }

    const joiningUser = await User.findOne({ id: req.session.userId });

    if (!joiningUser) {
      throw new Error("Oh no! Something has gone terribly wrong, but how!?!?");
    }

    if (!game.messages) game.messages = [[joiningUser.nickname, "has joined the game!"]];
    else game.messages.push([joiningUser.nickname.toUpperCase(), "has joined the game!"]);

    game.user2 = joiningUser;

    const savedGame = await getConnection()
      .createQueryBuilder()
      .update(Game)
      .set({
        messages: () => `ARRAY[${messagesToString((game as Game).messages)}]`,
        user2: game.user2,
      })
      .where("gameUUID = :gameUUID", { gameUUID: game.gameUUID })
      .returning("*")
      .execute();

    game = savedGame.raw[0] as Game;
    const payload = game;
    await pubsub.publish(String(gameId), payload);
    console.log(game);

    return game;
  }

  @Query(() => Game, { nullable: true })
  async fetchGameInfos(@Arg("gameId") gameId: string): Promise<Game | null> {
    const game = await Game.findOne({ gameUUID: gameId });

    if (!game) {
      return null;
    }

    return game;
  }

  @Subscription(() => Game, { topics: (payload) => payload.args.gameId })
  async gameSubscription(@Root() payLoad: any, @Arg("gameId") _: string): Promise<Game | null> {
    return payLoad;
  }

  @Mutation(() => Game)
  @UseMiddleware(isAuth)
  async movePiece(
    @Arg("gameId") gameId: string,
    @Arg("gameBoard", () => [[Int]]) proposedGameBoard: number[][],
    @Ctx() { req }: MyContext,
    @PubSub() pubsub: PubSubEngine
  ): Promise<Game | null> {
    if (proposedGameBoard.length !== 6 /* row check */ || proposedGameBoard[0].length !== 7 /* column check */) {
      throw new Error("GameBoard malformed :yikes:");
    }

    const game = await Game.findOne({ gameUUID: gameId });

    if (!game) {
      return null;
    }

    if (req.session.userId != game.user1Id && req.session.userId != game.user2Id) {
      throw new Error("Hmm pretty sus, you got any form of identification on you?");
    }

    if (req.session.userId != game.whoseMove) {
      throw new Error("Not your move mr hacker!");
    }

    if (game.whoWon) {
      throw new Error("Game has been won!");
    }

    const refereeResponse = referee(game.gameBoard, proposedGameBoard, req.session.userId == game.user1Id ? 1 : 2);

    if (refereeResponse === 0) {
      throw new Error("Illegal Move Homie");
    }

    game.gameBoard = proposedGameBoard;
    game.whoseMove = req.session.userId == game.user1Id ? game.user2Id : game.user1Id;

    if (refereeResponse === 2) {
      // Player won
      await getConnection()
        .createQueryBuilder()
        .update(Game)
        .set({
          gameBoard: proposedGameBoard,
          whoWon: req.session.userId == game.user1Id ? game.user1Id : game.user2Id,
          whoseMove: req.session.userId == game.user1Id ? game.user2Id : game.user1Id,
        })
        .where("gameUUID = :gameUUID", { gameUUID: game.gameUUID })
        .execute();

      game.whoWon = req.session.userId == game.user1Id ? game.user1Id : game.user2Id;
    } else {
      //successfull move
      await getConnection()
        .createQueryBuilder()
        .update(Game)
        .set({
          gameBoard: proposedGameBoard,
          whoseMove: req.session.userId == game.user1Id ? game.user2Id : game.user1Id,
        })
        .where("gameUUID = :gameUUID", { gameUUID: game.gameUUID })
        .execute();
    }

    const payload = game;
    await pubsub.publish(String(gameId), payload);
    return game;
  }
}

const referee = (curr: number[][], proposed: number[][], userColor: number): number => {
  let differences: number[][] = [];

  //finding differences between boards
  for (let i = 0; i < curr.length; i++) {
    for (let j = 0; j < curr[0].length; j++) {
      if (curr[i][j] !== proposed[i][j]) {
        differences.push([i, j]);
      }
    }
  }

  console.log("differences", differences);

  if (differences.length > 1 || differences.length == 0) {
    console.log("differences.length > 1", differences.length > 1);
    return 0;
  }

  if (proposed[differences[0][0]][differences[0][1]] !== userColor) {
    console.log("move color bug");
    return 0;
  }

  const y: number = differences[0][0];
  const x: number = differences[0][1];

  if (curr[y][x] !== 0) {
    //move is replacing a piece / illegal move
    console.log("move is replacing a piece");
    return 0;
  }

  if (y !== 5 /* placed piece on bottom of board */) {
    if (curr[y + 1][x] === 0 /* makes sure piece isnt floating */) {
      console.log("air move or some shit");
      return 0;
    }
  }

  /*
      GAMEBOARD EXAMPLE
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2],
    [1, 0, 0, 1, 0, 0, 2],
    */

  if (hasWon(proposed, userColor)) {
    return 2;
  }

  return 1;
};

const hasWon = (board: number[][], userColor: number): boolean => {
  const HEIGHT = board.length;
  const WIDTH = board[0].length;

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      var counter1 = 0;
      var counter2 = 0;
      var counter3 = 0;
      var counter4 = 0;

      if (board[i][j] === userColor) {
        //up
        if (j + 3 < WIDTH) {
          for (let k = 0; k < 4; k++) {
            if (board[i][j + k] !== userColor) {
              break;
            }
            counter1++;
          }
        }

        //right
        if (i + 3 < HEIGHT) {
          for (let k = 0; k < 4; k++) {
            if (board[i + k][j] !== userColor) {
              break;
            }
            counter2++;
          }
        }

        //upleft
        if (j + 3 < WIDTH && i + 3 < HEIGHT) {
          for (let k = 0; k < 4; k++) {
            if (board[i + k][j + k] !== userColor) {
              break;
            }
            counter3++;
          }
        }

        //upright
        if (i - 3 > 0 && j + 3 < WIDTH) {
          for (let k = 0; k < 4; k++) {
            if (board[i - k][j + k] !== userColor) {
              break;
            }
            counter4++;
          }
        }
      }
      if (counter1 === 4 || counter2 === 4 || counter3 === 4 || counter4 === 4) return true;
    }
  }

  return false;
};

///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY

///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY

///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY

///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY

///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY

///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY

///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
///TODO: FIX ID ERROR ON MOVE, FIX GAMEBOARD ON MOVE THINGY
