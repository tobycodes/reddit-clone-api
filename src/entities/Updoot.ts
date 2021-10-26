import { Entity, BaseEntity, ManyToOne, PrimaryColumn, Column } from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Post } from "@entities/Post";
import { User } from "@entities/User";

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Field()
  @Column({ type: "int" })
  value!: number;

  @Field()
  @PrimaryColumn()
  userId!: number;

  @Field(() => User)
  @ManyToOne(() => Post, (user) => user.updoots)
  user!: User;

  @Field()
  @PrimaryColumn()
  postId!: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.updoots, { onDelete: "CASCADE" })
  post!: Post;
}
