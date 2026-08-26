import { CustomError } from "../../../errors/CustomError";

export class CheckPasswordDto {
  private constructor(
    public readonly userId: number,
    public readonly rawPassword: string,
  ) {}

  static create(object: {
    userId: any;
    rawPassword: any;
  }): [CustomError?, CheckPasswordDto?] {
    const { userId, rawPassword } = object;

    if (!userId) {
      return [CustomError.badRequest("userId is required")];
    }

    const parsedUserId = Number(userId);
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      return [CustomError.badRequest("userId is missing or invalid")];
    }

    if (!rawPassword || typeof rawPassword !== "string") {
      return [
        CustomError.badRequest("rawPassword is required and must be a string"),
      ];
    }
    if (rawPassword.length < 8 || rawPassword.length > 100) {
      return [
        CustomError.badRequest(
          "rawPassword must be between 8 and 100 characters",
        ),
      ];
    }

    return [
      undefined,
      new CheckPasswordDto(parsedUserId, rawPassword),
    ];
  }
}
