import { UserRegisterInput } from "@custom-types/user";
import { FieldError } from "@custom-types/index";

export const validateRegister = (input: UserRegisterInput): FieldError[] | null => {
  const { username, email, password, confirmPassword } = input;

  if (!username) return [{ name: "username", message: "Username is required" }];

  if (username.includes("@"))
    return [{ name: "username", message: "Username must not include invalid characters like '@'" }];

  if (!email) return [{ name: "email", message: "Email is required" }];

  if (!email.includes("@")) return [{ name: "email", message: "Email is invalid" }];

  if (password !== confirmPassword)
    return [
      { name: "password", message: "Passwords must match" },
      { name: "confirmPassword", message: "Passwords must match" },
    ];

  return null;
};
