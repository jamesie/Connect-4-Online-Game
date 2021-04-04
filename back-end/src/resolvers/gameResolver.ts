import { Game } from "../entites/Game";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../entites/User";
import { MyContext } from "../types";
import { getMongoManager } from "typeorm";

@Resolver()
export class gameResolver {
  @Query(() => String)
  ping() {
    return "pong";
  }

  @Mutation(() => User, { nullable: true })
  async createUser(@Arg("username") username: string, @Ctx() {req }: MyContext): Promise<User | null> {

    const manager = getMongoManager();

    console.log(username)
    const user = new User()
    user.nickname = username

    try {
      await manager.save(user);
      console.log(user._id)
    } catch (err) {
      console.log(user)
      console.log(err)
      return null;
    }

    req.session.userId = user._id;

    return user;
  }

  @Query(() => User)
  async me(@Ctx() { req }: MyContext): Promise<User | null> {
    const user = await User.findOne({
      where: {
        id: req.session.userId,
      },
    });
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
