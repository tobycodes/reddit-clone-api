import { MiddlewareFn } from "type-graphql";
import { ApiResponse, Context } from "@custom-types/index";

export const IsAuthenticated: MiddlewareFn<Context> = ({ context }, next): Promise<ApiResponse> => {
  if (!context.req.session.userId)
    return new Promise((res) => res({ message: "You are not logged in", status: "error" }));

  return next();
};
