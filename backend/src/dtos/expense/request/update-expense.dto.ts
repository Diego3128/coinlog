import { CustomError } from "../../../errors/CustomError";

export class UpdateExpenseDto {
  public readonly name?: string;
  public readonly amount?: number;
  public readonly expenseId: number;
  public readonly userId: number;

  private constructor(data: {
    name?: string;
    amount?: number;
    expenseId: number;
    userId: number;
  }) {
    this.name = data.name;
    this.amount = data.amount;
    this.expenseId = data.expenseId;
    this.userId = data.userId;
  }

  static create(
    object: { [key: string]: any } = {},
    expenseId: any,
    userId: any,
  ): [CustomError?, UpdateExpenseDto?] {
    const { name, amount } = object;

    const parsedUserId = parseInt(userId);
    if (!userId) {
      return [CustomError.unAuthorized(`userId is missing`)];
    }

    if (parsedUserId < 1 || isNaN(parsedUserId)) {
      return [CustomError.unAuthorized(`userId is invalid`)];
    }

    const parsedExpenseId = parseInt(expenseId);
    if (!expenseId) {
      return [CustomError.badRequest(`expenseId is missing`)];
    }

    if (parsedExpenseId < 1 || isNaN(parsedExpenseId)) {
      return [CustomError.badRequest(`expenseId is invalid`)];
    }

    if (!name && amount === undefined) {
      return [
        CustomError.badRequest(
          "At least one field (name or amount) must be provided to update",
        ),
      ];
    }

    let validatedName: string | undefined;
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return [CustomError.badRequest("Name must be a non-empty string")];
      }

      if (typeof name === "string" && name.length > 255) {
        return [
          CustomError.badRequest("Name must be less than 255 characters"),
        ];
      }

      if (typeof name === "string" && name.length > 255) {
        return [
          CustomError.badRequest("Name must be less than 255 characters"),
        ];
      }
      validatedName = name.trim();
    }

    let validatedAmount: number | undefined;
    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return [
          CustomError.badRequest("Amount must be a valid positive number"),
        ];
      }
      validatedAmount = parsedAmount;
    }

    return [
      undefined,
      new UpdateExpenseDto({ name: validatedName, amount: validatedAmount, expenseId: parsedExpenseId, userId: parsedUserId }),
    ];
  }

  get values() {
    const returnValues: { [key: string]: any } = {};
    if (this.name !== undefined) returnValues.name = this.name;
    if (this.amount !== undefined) returnValues.amount = this.amount;
    return returnValues;
  }
}
