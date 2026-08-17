import { CustomError } from "../../errors/CustomError";

export class LoginUserDto {
  private constructor(
    public readonly email: string,
    public readonly password: string
  ) {}

  static create(object: { [key: string]: any } = {}): [CustomError?, LoginUserDto?] {
    const { email, password } = object;

    // Validate Email
    if (!email || typeof email !== "string" || email.trim().length === 0) {
      return [CustomError.badRequest("email is required and must be a non-empty string")];
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return [CustomError.badRequest("email must be a valid email address")];
    }
    if (cleanEmail.length > 255) {
      return [CustomError.badRequest("email must not exceed 255 characters")];
    }

    // Validate Password
    if (!password || typeof password !== "string") {
      return [CustomError.badRequest("password is required and must be a string")];
    }
    // if (password.length < 8 || password.length > 100) {
    //   return [CustomError.badRequest("password must be between 8 and 100 characters")];
    // }

    return [
      undefined,
      new LoginUserDto(
        cleanEmail,
        password
      ),
    ];
  }
}