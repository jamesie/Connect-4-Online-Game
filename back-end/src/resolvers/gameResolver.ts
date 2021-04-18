import { Game } from "../entites/Game";
import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { User } from "../entites/User";
import { MyContext } from "../types";
import { getMongoRepository } from "typeorm";
import { ObjectId } from "mongodb";
import { isAuth } from "../utils/isAuth";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { isCompositeType } from "graphql";
dotenv.config();

@Resolver()
export class gameResolver {
  @Query(() => String)
  ping() {
    return "pong";
  }

  @Mutation(() => User, { nullable: true })
  async createUser(@Arg("username") username: string, @Ctx() { req }: MyContext): Promise<User | null> {
    const user = new User();
    user.nickname = username;

    if (username.length < 4) {
      throw new Error("Your nickname must be greater than 3 characters long!");
    }

    try {
      const savedUser = await getMongoRepository(User).save(user);
      req.session.userId = savedUser._id;
    } catch (err) {
      return null;
    }

    return user;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<User | null> {
    const _id = new ObjectId(req.session.userId);

    const user = await getMongoRepository(User).findOne({ where: { _id } });

    if (!user) {
      return null;
    }

    return user;
  }

  @Mutation(() => Game, { nullable: true })
  @UseMiddleware(isAuth)
  //@ts-ignore
  async createGame(@Ctx() { req }: MyContext, @Arg("googleCaptchaToken") captchaToken: string): Promise<Game | null> {
    // const secret = process.env.RECAPTCHA_SECRET_KEY;

    // const grc = await fetch(
    //   `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${captchaToken}`,
    //   { method: "POST" }
    // );

    // const datares = await grc.json()

    // if (!datares.success) {
    //   throw new Error("Beep boop ;)");
    // }

    const game = new Game();
    // GameBoard: 0 means empty, 1 means player1/creator, 2 means joiner of game
    game.gameBoard = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ]; // 7 by 6

    const user1 = await getMongoRepository(User).findOne({ where: { _id: new ObjectId(req.session.userId) } });

    if (!user1) {
      throw new Error("Oh no! Something has gone terribly wrong, but how!?!?");
    }

    game.user1 = user1;
    game.user1Id = game.user1._id;
    game.whoseMove = user1._id;
    game.moveNum = 0;

    try {
      await getMongoRepository(Game).save(game);
    } catch (err) {
      throw new Error(err as string);
    }

    return game;
  }

  @Mutation(() => Game, { nullable: true })
  @UseMiddleware(isAuth)
  async joinGame(@Ctx() { req }: MyContext, @Arg("gameId") gameId: string): Promise<Game | null> {
    const _id: ObjectId = new ObjectId(gameId);

    const game = await getMongoRepository(Game).findOne({ where: { _id } });

    if (!game) {
      return null;
    }

    if (new ObjectId(req.session.userId).equals(game.user1Id)) {
      throw new Error("Trying to join own game");
    }

    if (game.user2) {
      throw new Error("Game full");
    }

    const joiningUserId = new ObjectId(req.session.userId);
    const joiningUser = await getMongoRepository(User).findOne({ where: { _id: joiningUserId } });

    if (!joiningUser) {
      throw new Error("Oh no! Something has gone terribly wrong, but how!?!?");
    }

    game.user1 = (await getMongoRepository(User).findOne({ where: { _id: new ObjectId(game.user1Id) } })) as User;
    game.user2 = joiningUser;
    game.user2Id = joiningUserId;

    await getMongoRepository(Game).updateOne({ _id }, { $set: { user2: joiningUser, user2Id: joiningUserId } });

    return game;
  }

  @Query(() => Game, { nullable: true })
  async fetchGameInfos(@Arg("gameId") gameId: string): Promise<Game | null> {
    const _id: ObjectId = new ObjectId(String(gameId));

    const game = await getMongoRepository(Game).findOne({ where: { _id } });

    if (!game) {
      return null;
    }

    const user1 = await getMongoRepository(User).findOne({ where: { _id: new ObjectId(game.user1Id) } });
    if (!user1) {
      throw new Error("Oh no! Something has gone terribly wrong, but how!?!?");
    }
    game.user1 = user1;

    const user2 = await getMongoRepository(User).findOne({ where: { _id: new ObjectId(game.user2Id) } });
    if (!user2) {
      game.user2 = null;
    } else {
      game.user2 = user2;
    }

    return game;
  }

  @Mutation(() => Game)
  @UseMiddleware(isAuth)
  async movePiece(
    @Arg("gameId") gameId: string,
    @Arg("gameBoard", () => [[Int]]) proposedGameBoard: number[][],
    @Ctx() { req }: MyContext
  ): Promise<Game | null> {
    if (proposedGameBoard.length !== 6 /* row check*/ || proposedGameBoard[0].length !== 7 /* column check*/) {
      throw new Error("GameBoard malformed :yikes:");
    }

    const _id: ObjectId = new ObjectId(gameId);

    const game = await getMongoRepository(Game).findOne({ where: { _id } });

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

    console.log("here2");
    if (refereeResponse === 0) {
      throw new Error("Illegal Move Homie");
    }

    if (refereeResponse === 2) {
      // Player won
      await getMongoRepository(Game).updateOne(
        { _id },
        {
          $set: {
            gameBoard: proposedGameBoard,
            whoWon: req.session.userId == game.user1Id ? game.user1Id : game.user2Id,
            whoseMove: req.session.userId == game.user1Id ? game.user2Id : game.user1Id,
          },
        }
      );
    }

    //  console.log("not illegal")

    await getMongoRepository(Game).updateOne(
      { _id },
      {
        $set: {
          gameBoard: proposedGameBoard,
          whoseMove: req.session.userId == game.user1Id ? game.user2Id : game.user1Id,
        },
      }
    );

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

  if (differences.length > 1 || differences.length == 0) {
    console.log("no move or hacked board");
    return 0;
  }

  if (proposed[differences[0][0]][differences[0][1]] !== userColor) {
    console.log("move color bug");
    return 0;
  }

  const y: number = differences[0][0];
  const x: number = differences[0][1];

  // console.log("y: ", y, "x: ", x);

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

  /* GAMEBOARD EXAMPLE
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
            console.log(k)
            if (board[i + k][j + k] !== userColor) {
              break;
            }
            console.log(k)
            counter3++;
          }
        } 


        //upright
        if (i - 3 > 0 && j + 3 < WIDTH) {
          
          for (let k = 0; k < 4; k++) {
            console.log(i , j , i + k, j + k)
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
