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

    const parsedExpenseId = parseInt(expenseId);
    if (!parsedExpenseId) {
      return [CustomError.badRequest(`expenseId is missing`)];
    }

    if (parsedExpenseId < 1 || isNaN(parsedExpenseId)) {
      return [CustomError.badRequest(`expenseId is invalid`)];
    }

    const parsedUserId = parseInt(userId);
    if (!userId) {
      return [CustomError.unAuthorized(`userId is missing`)];
    }

    if (parsedUserId < 1 || isNaN(parsedUserId)) {
      return [CustomError.unAuthorized(`userId is invalid`)];
    }

    return [
      undefined,
      new GetExpenseByIdDto({ expenseId: parsedExpenseId, userId: parsedUserId }),
    ];
  }
}
