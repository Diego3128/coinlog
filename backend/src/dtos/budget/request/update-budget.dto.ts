import { CustomError } from "../../../errors/CustomError";

/**
 * This DTO does not require all fields from the Budget model to be passed
 */
export class UpdateBudgetDto {
  private constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly name?: string,
    public readonly amount?: number,
  ) {}

  static create(
    object: { [key: string]: any } = {},
    id: any,
    userId: any,
  ): [CustomError?, UpdateBudgetDto?] {
    const { name, amount } = object;

    if (!id) {
      return [CustomError.badRequest("The budgetId is missing")];
    }

    const parsedBudgetId = parseInt(id);
    if (parsedBudgetId < 1 || isNaN(parsedBudgetId)) {
      return [CustomError.badRequest(`parsedBudgetId is invalid`)];
    }

    const parsedUserId = parseInt(userId);
    if (!userId) {
      return [CustomError.unAuthorized(`userId is missing`)];
    }

    if (parsedUserId < 1 || isNaN(parsedUserId)) {
      return [CustomError.unAuthorized(`userId is invalid`)];
    }

    // At least one field should be passed for the update
    if (!name && amount === undefined) {
      return [
        CustomError.badRequest(
          "At least one field (name or amount) must be provided to update",
        ),
      ];
    }

    // Validate name if passed
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

      validatedName = name.trim();
    }

    // Validar 'amount' if exists
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
      new UpdateBudgetDto(id, parsedUserId, validatedName, validatedAmount),
    ];
  }

  // Helper getter to get the passed values for the sequelize model
  get values() {
    const returnValues: { [key: string]: any } = {};
    if (this.name !== undefined) returnValues.name = this.name;
    if (this.amount !== undefined) returnValues.amount = this.amount;
    return returnValues;
  }
}
