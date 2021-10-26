import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";
import { Post } from "./Post";
import { Updoot } from "./Updoot";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int!)
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;

  @Field()
  @UpdateDateColumn({})
  updatedAt!: Date;

  @Field(() => [Post], { nullable: true })
  @OneToMany(() => Post, (post) => post.creator)
  posts!: Post[];

  @Field(() => [Updoot], { nullable: true })
  @OneToMany(() => Updoot, (updoot) => updoot.user)
  updoots!: Updoot[];
}
