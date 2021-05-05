import { Game } from "../entites/Game";
import {
  Arg,
  Args,
  Ctx,
  Int,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  Root,
  Subscription,
  UseMiddleware,
} from "type-graphql";
import { User } from "../entites/User";
import { MyContext } from "../types";
import { getConnection, getMongoRepository } from "typeorm";
import { ObjectId } from "mongodb";
import { isAuth } from "../utils/isAuth";
import { messagesToString } from "./gameResolver";

@Resolver()
export class messagesResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async sendMessage(
    @Arg("gameUUID") gameId: string,
    @Ctx() { req }: MyContext,
    @Arg("message") message: string,
    @PubSub() pubsub: PubSubEngine
  ): Promise<boolean> {
    let game = await Game.findOne({ gameUUID: gameId });

    if (!game) return false;

    if (req.session.userId != game.user1Id && req.session.userId != game.user2Id) {
      throw new Error("Hmm pretty sus, you got any form of identification on you?");
    }

    const userSendingMsg = await User.findOne(req.session.userId);

    if (!userSendingMsg) return false;

    game.messages.push([userSendingMsg.nickname, String(message)]);

    const savedGame = await getConnection()
      .createQueryBuilder()
      .update(Game)
      .set({
        messages: () => `ARRAY[${messagesToString((game as Game).messages)}]`,
      })
      .returning("*")
      .execute();

    savedGame.raw[0].user2Id = game.user2Id;
    
    const payload = savedGame.raw[0];
    await pubsub.publish(String(gameId), payload);

    return true;
  }
}
