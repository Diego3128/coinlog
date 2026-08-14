import { CustomError } from "../../errors/CustomError";

/**
 * All needed data to create a Expense object (except the budgetId)
*/
export class CreateExpenseDto {
  private constructor(
    public readonly name: string,
    public readonly amount: number,
  ) {}

  static create(object: { [key: string]: any } = {}): [CustomError?, CreateExpenseDto?] {
    const { name, amount, budgetId } = object;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return [CustomError.badRequest("Name is required and must be a valid string")];
    }

    if(typeof name === "string" && name.length > 255){
      return [CustomError.badRequest("Name must be less than 255 characters")];
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return [CustomError.badRequest("Amount must be a valid positive number")];
    }

    return [undefined, new CreateExpenseDto(name.trim(), parsedAmount)];
  }
}