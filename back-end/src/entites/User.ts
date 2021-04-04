import { BaseEntity, Entity, ObjectIdColumn, Column } from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";

import { ObjectId } from "mongodb";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  _id: ObjectId;

  @Field()
  @Column({ type: String })
  nickname!: string;
}
