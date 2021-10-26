import { ObjectType, Field, InputType } from "type-graphql";

import { ApiResponse, FieldError } from "./";
import { User } from "@entities/User";

@InputType()
export class UsernamePasswordInput {
  @Field()
  usernameOrEmail!: string;

  @Field()
  password!: string;
}

@InputType()
export class UserRegisterInput {
  @Field()
  username!: string;

  @Field()
  password!: string;

  @Field()
  confirmPassword!: string;

  @Field()
  email!: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  newPassword!: string;

  @Field()
  confirmPassword!: string;

  @Field()
  token!: string;
}

@ObjectType()
export class ForgotPasswordResponse extends ApiResponse {
  @Field({ nullable: true })
  token?: string;
}

@ObjectType()
export class UserResponse extends ApiResponse {
  @Field({ nullable: true })
  user?: User;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
