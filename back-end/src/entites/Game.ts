import { BaseEntity, Column, Entity, ManyToOne, ObjectID, ObjectIdColumn  } from "typeorm";
import { Field, ID, Int, ObjectType } from "type-graphql";
import { User } from "./User";

@ObjectType()
@Entity()
export class Game extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id: ObjectID;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => user.creatorOfGames)
  user1: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => user.joins)
  user2: User;

  @Field(() => [[Int]], { nullable: true })
  @Column()
  gameBoard: number[][]
}
