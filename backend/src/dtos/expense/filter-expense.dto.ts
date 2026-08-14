import { CustomError } from "../../errors/CustomError";
import Expense from "../../models/Expense";

export class FilterExpenseDto {
  private constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly sortBy: string,
    public readonly order: "ASC" | "DESC",
    public readonly name?: string,
  ) {}

  static create(query: { [key: string]: any } = {}): [CustomError?, FilterExpenseDto?] {
    const { page = 1, limit = 10, sortBy = "createdAt", order = "DESC", name, budgetId } = query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    if (isNaN(parsedPage) || parsedPage <= 0) return [CustomError.badRequest("Page must be a positive integer")];
    if (isNaN(parsedLimit) || parsedLimit <= 0) return [CustomError.badRequest("Limit must be a positive integer")];

    const normalizedOrder = String(order).toUpperCase();
    if (normalizedOrder !== "ASC" && normalizedOrder !== "DESC") {
      return [CustomError.badRequest("Order must be either ASC or DESC")];
    }

    const validColumns = Object.keys(Expense.getAttributes());
    if (!validColumns.includes(sortBy)) {
      return [CustomError.badRequest(`Invalid sortBy column '${sortBy}'. Allowed fields: ${validColumns.join(", ")}`)];
    }

    return [
      undefined,
      new FilterExpenseDto(
        parsedPage,
        parsedLimit,
        sortBy,
        normalizedOrder as ("ASC" | "DESC"),
        name ? String(name).trim() : undefined,
      ),
    ];
  }

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}