import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";
import { User } from "./User";
import { Updoot } from "./Updoot";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => Int!)
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Field()
  @Column({ type: "text" })
  title!: string;

  @Field(() => Int!)
  @Column()
  creatorId!: number;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ nullable: true })
  slug!: string;

  @Field(() => Int)
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field(() => Int, { nullable: true })
  voteStatus!: number;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt!: Date;

  @Field()
  @DeleteDateColumn()
  deletedAt!: Date;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  creator!: User;

  @Field(() => [Updoot], { nullable: true })
  @OneToMany(() => Updoot, (updoot) => updoot.post)
  updoots!: Updoot[];
}
