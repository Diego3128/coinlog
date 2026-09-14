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
  type InferOutput,
} from "valibot";

export const LoginSchema = pipe(
  object({
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
    )
  }),

);

export type LoginType = InferOutput<typeof LoginSchema>;


