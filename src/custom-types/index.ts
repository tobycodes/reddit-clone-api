import { Connection } from "typeorm";
import { Request, Response } from "express";
import { ObjectType, Field } from "type-graphql";
import { Redis } from "ioredis";
import { createUpdootLoader, createUserLoader } from "@utils/loaders";

interface Context {
  req: Request & { session: { userId?: number } };
  res: Response;
  redis: Redis;
  conn: Connection;
  userLoader: ReturnType<typeof createUserLoader>;
  updootLoader: ReturnType<typeof createUpdootLoader>
}

type Status = "success" | "error" | "fail";

@ObjectType()
class FieldError {
  @Field()
  name!: string;

  @Field()
  message!: string;
}

@ObjectType()
class ApiResponse {
  @Field()
  status!: Status;

  @Field({ nullable: true })
  message?: String;
}

export { FieldError, ApiResponse, Status, Context };
