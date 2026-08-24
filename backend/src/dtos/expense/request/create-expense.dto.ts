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
    budgetId: number,
    userId: number,
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

    if (!userId || isNaN(userId) || userId < 0) {
      return [CustomError.badRequest("userId is missing or invalid")];
    }

    if (!budgetId || isNaN(budgetId) || budgetId < 0) {
      return [CustomError.badRequest("budgetId is missing or invalid")];
    }

    return [
      undefined,
      new CreateExpenseDto(name.trim(), parsedAmount, budgetId, userId),
    ];
  }
}
