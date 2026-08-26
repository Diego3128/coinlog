import { CustomError } from "../../../errors/CustomError";

export class GetExpenseByIdDto {
  public readonly expenseId: number;
  public readonly userId: number;

  private constructor(data: { expenseId: number; userId: number }) {
    this.expenseId = data.expenseId;
    this.userId = data.userId;
  }

  static create(
    expenseId: any,
    userId: any,
  ): [CustomError?, GetExpenseByIdDto?] {

    if (!userId || !expenseId) {
      return [CustomError.badRequest("userId and expenseId are required")];
    }

    const parsedExpenseId = Number(expenseId);
    if (isNaN(parsedExpenseId) || parsedExpenseId <= 0) {
      return [CustomError.badRequest("expenseId is missing or invalid")];
    }

    const parsedUserId = Number(userId);
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      return [CustomError.badRequest("userId is missing or invalid")];
    }

    return [undefined, new GetExpenseByIdDto({ expenseId, userId })];
  }
}
