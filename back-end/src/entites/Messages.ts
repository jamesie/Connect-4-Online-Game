import { BaseEntity, Column, Entity, ObjectIdColumn  } from "typeorm";
import { Field, ID, Int, ObjectType } from "type-graphql";
import { User } from "./User";
import { ObjectId } from 'mongodb'

export type messageType = [string, string]

@ObjectType()
@Entity()
export class Messages extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id!: ObjectId;

  @Field(() => ID)
  @Column()
  gameId!: ObjectId;

  @Field(() => [[String, String]])
  @Column()
  messages!: messageType[];

  @Field(() => ID)
  @Column()
  user1Id!: ObjectId;

  @Field(() => ID, { nullable: true })
  @Column()
  user2Id: ObjectId | null;
}



