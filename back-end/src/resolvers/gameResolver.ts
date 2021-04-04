import { Game } from "../entites/Game";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../entites/User";
import { MyContext } from "../types";
import { getMongoManager, getMongoRepository } from "typeorm";
import { ObjectId } from "mongodb";

@Resolver()
export class gameResolver {
  @Query(() => String)
  ping() {
    return "pong";
  }

  @Mutation(() => User, { nullable: true })
  async createUser(@Arg("username") username: string, @Ctx() { req }: MyContext): Promise<User | null> {
    const manager = getMongoManager();

    const user = new User();
    user.nickname = username;

    try {
      await manager.save(user);
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
  async createGame(): Promise<Game | null> {
    const game = await Game.findOne();

    if (!game) {
      return null;
    }
    return game;
  }
}
