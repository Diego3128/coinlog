import { CustomError } from "../../../errors/CustomError";

export class GetUserByIdDto {
  public readonly userId: number;
  private constructor(userId: number) {
    this.userId = userId;
  }

  public static create = (userId: any): [CustomError?, GetUserByIdDto?] => {
    if (!userId) {
      return [CustomError.badRequest("userId is required")];
    }

    const parsedUserId = Number(userId);
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      return [CustomError.badRequest("userId is invalid. Must be a positive integer")];
    }

    return [undefined, new GetUserByIdDto(parsedUserId)];
  };
}
