import { MiddlewareFn } from "type-graphql";
import { ApiResponse, Context } from "@custom-types/index";

export const IsAuthorized: MiddlewareFn<Context> = ({ context, args }, next): Promise<ApiResponse> => {
  if (!context.req.session.userId)
    return new Promise((res) => res({ message: "You are not logged in", status: "error" }));

  return next();
};
