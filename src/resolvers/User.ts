import { Ctx, Arg, Mutation, Query, Resolver, FieldResolver, Root, UseMiddleware } from "type-graphql";
import argon2 from "argon2";
import { v4 } from "uuid";

import { ApiResponse, Context } from "@custom-types/index";
import { User } from "@entities/User";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "@config/index";
import {
  UserResponse,
  UserRegisterInput,
  UsernamePasswordInput,
  ChangePasswordInput,
  ForgotPasswordResponse,
} from "@custom-types/user";
import { validateRegister } from "@validations/validateRegister";
import { loginErrors } from "@validations/validateLogin";
import { sendEmail } from "@utils/sendEmail";
import { IsAuthenticated } from "@middleware/isAuthenticated";

@Resolver(User)
export class UserResolver {
  @Mutation(() => UserResponse!)
  async register(@Ctx() { req }: Context, @Arg("input") input: UserRegisterInput): Promise<UserResponse> {
    // Run validation and return any errors
    const errors = validateRegister(input);

    if (errors) {
      return { errors, status: "error" };
    }

    const { username, email, password } = input;

    try {
      const saltLength = 10;
      const hashedPassword = await argon2.hash(password, { saltLength });
      const user = User.create({
        username: username.toLowerCase(),
        password: hashedPassword,
        email: email.toLowerCase(),
      });

      await User.save(user);

      req.session.userId = user.id;

      return { user, status: "success", message: "Registration successful" };
    } catch (error: any) {
      if (error.code == 23505) {
        const errorKey = error.detail.includes("username") ? "username" : "email";

        return {
          status: "fail",
          errors: [{ name: errorKey, message: `${errorKey} already taken` }],
        };
      }

      return {
        status: "fail",
        message: `The server failed with code: ${(error as any).code}. Message: ${(error as any).message}`,
      };
    }
  }

  @Mutation(() => UserResponse!)
  async login(@Ctx() { req }: Context, @Arg("input") input: UsernamePasswordInput): Promise<UserResponse> {
    const { usernameOrEmail, password } = input;

    const user = await User.findOne({ where: [{ email: usernameOrEmail }, { username: usernameOrEmail }] });

    if (!user) {
      return { errors: loginErrors, status: "error" };
    }

    const verified = await argon2.verify(user.password, password);

    if (!verified) {
      return { errors: loginErrors, status: "error" };
    }

    req.session.userId = user.id;

    return { user, status: "success", message: "Logged in successfully" };
  }

  @Mutation(() => ApiResponse!)
  @UseMiddleware(IsAuthenticated)
  async logout(@Ctx() { req, res }: Context): Promise<ApiResponse> {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        if (err) {
          console.error(err);
          return resolve({ status: "fail", message: err.message });
        }

        res.clearCookie(COOKIE_NAME);

        return resolve({ status: "success", message: "Successfully logged out" });
      })
    );
  }

  @Mutation(() => ForgotPasswordResponse!)
  async forgotPassword(@Ctx() { redis }: Context, @Arg("email") email: string): Promise<ForgotPasswordResponse> {
    const user = await User.findOne({ where: { email } });

    if (!user) return { status: "error", message: "Email does not belong to any user" };

    const token = v4();

    await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, "ex", 1000 * 60 * 60 * 24 * 3 /* 3 days */);

    const html = `<a href='http://localhost:3001/change-password/${token}'>Reset password</a>`;

    await sendEmail(email, html);

    return { status: "success", message: "Please check your email for link to reset password", token };
  }

  @Mutation(() => UserResponse!)
  async changePassword(
    @Ctx() { redis, req }: Context,
    @Arg("input") input: ChangePasswordInput
  ): Promise<UserResponse> {
    const key = FORGET_PASSWORD_PREFIX + input.token;
    const userId = await redis.get(key);

    if (!userId) return { status: "error", message: "Token is invalid. Please restart the process" };

    if (input.newPassword !== input.confirmPassword)
      return {
        status: "error",
        errors: [
          { name: "newPassword", message: "Passwords must match" },
          { name: "confirmPassword", message: "Passwords must match" },
        ],
      };

    const user = await User.findOne(parseInt(userId));

    if (!user) return { status: "error", message: "User does not exist" };

    const saltLength = 10;

    // Save user and clear token from redis
    await Promise.all([
      User.update({ id: user.id }, { password: await argon2.hash(input.newPassword, { saltLength }) }),
      redis.del(key),
    ]);

    //Notify user that their password has been changed
    const html = "<p>Your password has been successfully changed</p>";
    await sendEmail(user.email, html);

    req.session.userId = user.id;

    return { user, status: "success", message: "Password changed successfully" };
  }

  @Query(() => UserResponse!)
  @UseMiddleware(IsAuthenticated)
  async me(@Ctx() { req }: Context): Promise<UserResponse> {
    const user = await User.findOne(req.session.userId, { relations: ["posts", "updoots"] });

    if (!user) {
      return { status: "fail", message: "User not found" };
    }

    return { user, status: "success" };
  }

  // RESOLVE `email` FIELD on USER
  @FieldResolver()
  email(@Root() root: User, @Ctx() { req }: Context) {
    if (req.session.userId === root.id) return root.email;

    return "";
  }
}
