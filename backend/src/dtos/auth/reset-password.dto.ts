import { CustomError } from "../../errors/CustomError";

export class ResetPasswordDto {
  private constructor(
    public readonly email: string,
    public readonly newPassword: string,
    public readonly recoveryToken: string,
  ) {}

  static create(
    object: { [key: string]: any } = {},
  ): [CustomError?, ResetPasswordDto?] {
    const { email, newPassword, recoveryToken } = object;

    // Validate Email
    if (!email || typeof email !== "string" || email.trim().length === 0) {
      return [
        CustomError.badRequest(
          "email is required and must be a non-empty string",
        ),
      ];
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
    if (!newPassword || typeof newPassword !== "string") {
      return [
        CustomError.badRequest("newPassword is required and must be a string"),
      ];
    }
    if (newPassword.length < 8 || newPassword.length > 100) {
      return [
        CustomError.badRequest(
          "newPassword must be between 8 and 100 characters",
        ),
      ];
    }

    //validate token

    const parsedToken = Number(recoveryToken ?? "");

    if (
      !recoveryToken ||
      typeof recoveryToken !== "string" ||
      recoveryToken.length !== 6 ||
      isNaN(parsedToken)
    ) {
      return [CustomError.badRequest("recoveryToken is invalid")];
    }

    return [
      undefined,
      new ResetPasswordDto(cleanEmail, newPassword, recoveryToken),
    ];
  }
}
