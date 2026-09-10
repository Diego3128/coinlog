import {
  object,
  string,
  pipe,
  trim,
  nonEmpty,
  maxLength,
  minLength,
  email,
  toLowerCase,
  forward,
  partialCheck,
  type InferOutput,
} from "valibot";

export const RegisterSchema = pipe(
  object({
    firstName: pipe(
      string("Please enter a valid first name"),
      trim(),
      nonEmpty("Please enter your first name"),
      maxLength(255, "First name is too long"),
    ),
    lastName: pipe(
      string("Please enter a valid last name"),
      trim(),
      nonEmpty("Please enter your last name"),
      maxLength(255, "Last name is too long"),
    ),
    username: pipe(
      string("Please enter a valid username"),
      trim(),
      nonEmpty("Please choose a username"),
      minLength(3, "Username must be at least 3 characters"),
      maxLength(255, "Username is too long"),
    ),
    email: pipe(
      string("Please enter a valid email address"),
      trim(),
      nonEmpty("Please enter your email address"),
      toLowerCase(),
      email("Please enter a valid email address"),
      maxLength(255, "Email address is too long"),
    ),
    password: pipe(
      string("Please enter a valid password"),
      minLength(8, "Password must be at least 8 characters"),
      maxLength(100, "Password must not exceed 100 characters"),
    ),
    passwordConfirmation: pipe(
      string("Please confirm your password"),
      minLength(1, "Please confirm your password"),
    ),
  }),
  forward(
    partialCheck(
      [["password"], ["passwordConfirmation"]],
      (input) => input.password === input.passwordConfirmation,
      "Passwords do not match",
    ),
    ["passwordConfirmation"],
  ),
);

export type RegisterType = InferOutput<typeof RegisterSchema>;


