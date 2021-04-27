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
import { getMongoRepository } from "typeorm";
import { ObjectId } from "mongodb";
import { isAuth } from "../utils/isAuth";
import { Messages, messageType } from '../entites/Messages';

@Resolver()
export class messagesResolver {
  @Query(() => Messages)
  async fetchMessages( @Arg("messagesId") messagesId: string) {
    return await getMongoRepository(Messages).findOne({ where: { _id: new ObjectId(messagesId) } })
  }

  @Subscription(() => Messages, { topics: (payload) => payload.args.messagesId })
  async messagesSubscription(@Root() payLoad: any, @Arg("messagesId") _: string): Promise<Game | null> {
    return payLoad;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async sendMessage(@Arg("messagesId") messagesId: string, @Ctx() { req }: MyContext, @Arg("message") message: string, @PubSub() pubsub: PubSubEngine): Promise<boolean>{
    if (!message || message.length < 1){
      return false
    }
    const messagesObj = await getMongoRepository(Messages).findOne({ where: { _id: new ObjectId(messagesId) } })

    if (!messagesObj){
      return false
    }
    const messagesArr: messageType[] = messagesObj?.messages

    const user = await getMongoRepository(User).findOne({ where: { _id: req.session?.userId } })

    if (!user){
      return false
    }

    console.log("dasdsa", messagesObj)

    if (user._id !== messagesObj.user1ID || user._id !== messagesObj.user2ID){
      return false;
    }

    messagesArr.push([user.nickname, message])

    messagesObj.messages = messagesArr

    await getMongoRepository(Messages).updateOne(
      { _id: messagesObj._id },
      { $set: { messages: messagesArr } }
    );

    pubsub.publish(String(messagesId), messagesObj)

    return true
  }

  

}