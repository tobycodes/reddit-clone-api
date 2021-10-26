import { FieldError } from "@custom-types/index";
import { Field, InputType, ObjectType } from "type-graphql";
import { Post } from "@entities/Post";
import { ApiResponse } from "./";

@InputType()
export class PostInput {
  @Field()
  title!: string;

  @Field()
  text!: string;
}

@ObjectType()
export class PostResponse extends ApiResponse {
  @Field(() => Post, { nullable: true })
  post?: Post;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@ObjectType()
export class PostsResponse extends ApiResponse {
  @Field(() => [Post], { nullable: true })
  posts?: Post[];

  @Field()
  hasMore?: boolean;

  @Field()
  cursor?: string;
}
