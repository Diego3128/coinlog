import { CustomError } from "../../errors/CustomError";

export class ForgotPasswordDto {
  private constructor(
    public readonly email: string,
  ) {}

  static create(object: { [key: string]: any } = {}): [CustomError?, ForgotPasswordDto?] {
    const { email } = object;

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

    return [
      undefined,
      new ForgotPasswordDto(
        cleanEmail,
      ),
    ];
  }
}