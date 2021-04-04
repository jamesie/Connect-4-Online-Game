import { Game } from "../entites/Game";
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { User } from "../entites/User";
import { MyContext } from "../types";
import { getMongoRepository } from "typeorm";
import { ObjectId } from "mongodb";
import { isAuth } from "../utils/isAuth";

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

    try {
      await getMongoRepository(User).save(user);
    } catch (err) {
      return null;
    }
    req.session.userId = user._id;

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
  async createGame(@Ctx() { req }: MyContext): Promise<Game | null> {
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
    console.log("gameId", _id, typeof _id);

    const game = await getMongoRepository(Game).findOne({ where: { _id } });

    if (!game) {
      return null;
    }

    if ((new ObjectId(req.session.userId)).equals(game.user1Id)) {
      throw new Error("Trying to join own game");
    }

    const joiningUserId = new ObjectId(req.session.userId)
    const joiningUser = await getMongoRepository(User).findOne({ where: { _id: joiningUserId } });

    if (!joiningUser) {
      throw new Error("Oh no! Something has gone terribly wrong, but how!?!?");
    } 

    game.user1 = await getMongoRepository(User).findOne({ where: { _id: new ObjectId(game.user1Id) } }) as User;
    game.user2 = joiningUser;
    game.user2Id = joiningUserId

    await getMongoRepository(Game).updateOne({_id}, { $set: { user2: joiningUser, user2Id: joiningUserId}})

    return game;
  }

  @Query(() => Game)
  @UseMiddleware(isAuth)
  async fetchGameInfos(@Arg("gameId") gameId: string, @Ctx() { req }: MyContext,): Promise<Game | null> {
    const _id: ObjectId = new ObjectId(gameId);
    console.log("gameId", _id, typeof _id);

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

    if (!(req.session.userId)?.equals(game.user1Id) || !(req.session.userId)?.equals(game.user2Id)) {
      throw new Error("Hmm pretty sus, you got any form of identification on you?");
    }

    return game;
  }
}
