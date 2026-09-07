import { CustomError } from "../../../errors/CustomError";

/**
 * All needed data to create a Expense object
 */
export class CreateExpenseDto {
  private constructor(
    public readonly name: string,
    public readonly amount: number,
    public readonly budgetId: number,
    public readonly userId: number,
  ) {}

  static create(
    object: { [key: string]: any } = {},
    budgetId: any,
    userId: any,
  ): [CustomError?, CreateExpenseDto?] {
    const { name, amount } = object;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return [
        CustomError.badRequest("Name is required and must be a valid string"),
      ];
    }

    if (typeof name === "string" && name.length > 255) {
      return [CustomError.badRequest("Name must be less than 255 characters")];
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return [CustomError.badRequest("Amount must be a valid positive number")];
    }

    const parsedUserId = parseInt(userId);
    if (!userId) {
      return [CustomError.unAuthorized(`userId is missing`)];
    }

    if (parsedUserId < 1 || isNaN(parsedUserId)) {
      return [CustomError.unAuthorized(`userId is invalid`)];
    }

    const parsedBudgetId = parseInt(budgetId);
    if (!parsedBudgetId) {
      return [CustomError.badRequest(`budgetId is missing`)];
    }

    if (parsedBudgetId < 1 || isNaN(parsedBudgetId)) {
      return [CustomError.badRequest(`budgetId is invalid`)];
    }

    return [
      undefined,
      new CreateExpenseDto(name.trim(), parsedAmount, parsedBudgetId, parsedUserId),
    ];
  }
}
