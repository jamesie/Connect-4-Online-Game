import { BaseEntity, Entity, ObjectIdColumn, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn } from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";

import { ObjectId } from "mongodb";
import { Game } from "./Game";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ type: String })
  nickname!: string;

  @OneToMany(() => Game, (game) => game.user1)
  @JoinColumn()
  creator: Game[];

  @OneToMany(() => Game, (game) => game.user2)
  @JoinColumn()
  joiner: Game[];
}

