import { CustomError } from "../../../errors/CustomError";

export class UpdatePasswordDto {
  private constructor(
    public readonly userId: number,
    public readonly prevPassword: string,
    public readonly newPassword: string,
  ) {}

  static create(object: {
    userId: any;
    prevPassword: any;
    newPassword: any;
  }): [CustomError?, UpdatePasswordDto?] {
    const { userId, prevPassword, newPassword } = object;

    if (!userId) {
      return [CustomError.badRequest("userId is required")];
    }

    const parsedUserId = Number(userId);
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      return [CustomError.badRequest("userId is missing or invalid")];
    }

    // Validate Prev Password
    if (!prevPassword || typeof prevPassword !== "string") {
      return [
        CustomError.badRequest("prevPassword is required and must be a string"),
      ];
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

    return [
      undefined,
      new UpdatePasswordDto(parsedUserId, prevPassword, newPassword),
    ];
  }
}
