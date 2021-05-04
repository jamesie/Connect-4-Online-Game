import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, ObjectIdColumn, OneToOne, PrimaryGeneratedColumn  } from "typeorm";
import { Field, ID, Int, ObjectType } from "type-graphql";
import { User } from "./User";
import { ObjectId } from 'mongodb'
import { uuid } from 'uuidv4';

export type messageType = [string, string]

@ObjectType()
@Entity()
export class Game extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: string;

  @ManyToOne(() => User, (user) => user.creator)
  @JoinColumn()
  user1!: User;

  @ManyToOne(() => User, (user) => user.joiner)
  @JoinColumn()
  user2: User | null;

  @Field(() => [[Int]], { nullable: true })
  @Column("int", { array: true })
  gameBoard: number[][]

  @Field()
  @Column()
  whoseMove: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  whoWon: number;

  @Field(() => [[String, String]])
  @Column("simple-array", { array: true})
  messages!: messageType[];

  @Field(() => Int)
  @Column()
  user1Id: number


  @Field(() => Int)
  @Column({ nullable: true })
  user2Id: number

  @Field(() => String)
  @Column({unique: true})
  gameUUID: string
}




