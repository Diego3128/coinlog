import {
  object,
  string,
  pipe,
  type InferOutput,
  boolean,
  optional,
  nullable,
} from "valibot";

export const UserSchema = pipe(
  object({
    firstName: string(),
    lastName: string(),
    username: string(),
    email: string(),
    confirmed: boolean(),
    profilePictureUrl: nullable(string()),
    createdAt: string(),
  }),
);

export type UserType = InferOutput<typeof UserSchema>;
