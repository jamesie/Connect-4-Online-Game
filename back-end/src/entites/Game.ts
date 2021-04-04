import { BaseEntity, Column, Entity, ObjectIdColumn  } from "typeorm";
import { Field, ID, Int, ObjectType } from "type-graphql";
import { User } from "./User";
import { ObjectId } from 'mongodb'

@ObjectType()
@Entity()
export class Game extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id: ObjectId;

  @Field()
  user1!: User;

  @Field(() => User, { nullable: true })
  user2: User | null;

  @Field(() => [[Int]], { nullable: true })
  @Column()
  gameBoard: number[][]

  @Field(() => Int, {defaultValue: 0})
  @Column()
  moveNum: number

  @Field(() => ID)
  @Column()
  whoseMove: ObjectId;

  @Column()
  user1Id!: ObjectId

  @Column({ nullable: true })
  user2Id: ObjectId;
}




