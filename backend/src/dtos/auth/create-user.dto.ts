import { CustomError } from "../../errors/CustomError";

export class CreateUserDto {
  private constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly username: string,
    public readonly email: string,
    public readonly password: string
  ) {}

  static create(object: { [key: string]: any } = {}): [CustomError?, CreateUserDto?] {
    const { firstName, lastName, username, email, password } = object;

    // Validate First Name
    if (!firstName || typeof firstName !== "string" || firstName.trim().length === 0) {
      return [CustomError.badRequest("firstName is required and must be a non-empty string")];
    }
    if (firstName.trim().length > 255) {
      return [CustomError.badRequest("firstName must not exceed 255 characters")];
    }

    // Validate Last Name
    if (!lastName || typeof lastName !== "string" || lastName.trim().length === 0) {
      return [CustomError.badRequest("lastName is required and must be a non-empty string")];
    }
    if (lastName.trim().length > 255) {
      return [CustomError.badRequest("lastName must not exceed 255 characters")];
    }

    // Validate Username
    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return [CustomError.badRequest("username is required and must be a non-empty string")];
    }
    const cleanUsername = username.trim();
    if (cleanUsername.length < 3 || cleanUsername.length > 255) {
      return [CustomError.badRequest("username must be between 3 and 255 characters")];
    }

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
    if (password.length < 8 || password.length > 100) {
      return [CustomError.badRequest("password must be between 8 and 100 characters")];
    }

    return [
      undefined,
      new CreateUserDto(
        firstName.trim(),
        lastName.trim(),
        cleanUsername,
        cleanEmail,
        password
      ),
    ];
  }
}