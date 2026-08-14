import { CustomError } from "../../errors/CustomError";

export class UpdateExpenseDto {
  private constructor(
    public readonly name?: string,
    public readonly amount?: number
  ) {}

  static create(object: { [key: string]: any } = {}): [CustomError?, UpdateExpenseDto?] {
    const { name, amount } = object;

    if (!name && amount === undefined) {
      return [CustomError.badRequest("At least one field (name or amount) must be provided to update")];
    }

    let validatedName: string | undefined;
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return [CustomError.badRequest("Name must be a non-empty string")];
      }

          if(typeof name === "string" && name.length > 255){
      return [CustomError.badRequest("Name must be less than 255 characters")];
    }
    
    if(typeof name === "string" && name.length > 255){
      return [CustomError.badRequest("Name must be less than 255 characters")];
    }
      validatedName = name.trim();
    }

    let validatedAmount: number | undefined;
    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return [CustomError.badRequest("Amount must be a valid positive number")];
      }
      validatedAmount = parsedAmount;
    }

    return [undefined, new UpdateExpenseDto(validatedName, validatedAmount)];
  }

  get values() {
    const returnValues: { [key: string]: any } = {};
    if (this.name !== undefined) returnValues.name = this.name;
    if (this.amount !== undefined) returnValues.amount = this.amount;
    return returnValues;
  }
}