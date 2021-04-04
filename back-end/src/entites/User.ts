import { BaseEntity, Entity, ObjectIdColumn, OneToMany, Column } from "typeorm";
import { Field, ID, ObjectType } from 'type-graphql'
import { Game } from "./Game";
import { ObjectId } from 'mongodb'


@ObjectType()
@Entity()
export class User extends BaseEntity {
 @Field(() => ID)
 @ObjectIdColumn()
 _id: ObjectId;

 @Field()
 @Column({type: String})
 nickname!: string

 @Field(() => [Game], {nullable: true})
 @OneToMany(() => Game, game => game.user1)
 creatorOfGames: Game[];

 @Field(() => [Game], {nullable: true})
 @OneToMany(() => Game, game => game.user2)
 joins: Game[];
}