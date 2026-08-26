import { CustomError } from "../../../errors/CustomError";
import Expense from "../../../models/Expense";

export class FilterExpenseDto {
  public readonly userId: number;
  public readonly budgetId: number;
  public readonly page: number;
  public readonly limit: number;
  public readonly sortBy: string;
  public readonly order: "ASC" | "DESC";
  public readonly name?: string;

  private constructor(data: {
    page: number;
    limit: number;
    sortBy: string;
    order: "ASC" | "DESC";
    name?: string;
    userId: number;
    budgetId: number;
  }) {
    this.userId = data.userId,
    this.budgetId = data.budgetId,
    this.page = data.page,
    this.limit = data.limit,
    this.sortBy = data.sortBy,
    this.order = data.order,
    this.name = data.name
  }

  static create(
    query: { [key: string]: any } = {},
    budgetId: number,
    userId: number,
  ): [CustomError?, FilterExpenseDto?] {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "DESC",
      name,
    } = query;

    if (!userId || isNaN(userId)) {
      return [CustomError.badRequest("userId is missing or invalid")];
    }

    if (!budgetId || isNaN(budgetId)) {
      return [CustomError.badRequest("budgetId is missing or invalid")];
    }

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    if (isNaN(parsedPage) || parsedPage <= 0)
      return [CustomError.badRequest("Page must be a positive integer")];
    if (isNaN(parsedLimit) || parsedLimit <= 0)
      return [CustomError.badRequest("Limit must be a positive integer")];

    const normalizedOrder = String(order).toUpperCase();
    if (normalizedOrder !== "ASC" && normalizedOrder !== "DESC") {
      return [CustomError.badRequest("Order must be either ASC or DESC")];
    }

    const validColumns = Object.keys(Expense.getAttributes()).filter(c=> c !== "budgetId"); //budgetId should not be passed in the query
    if (!validColumns.includes(sortBy)) {
      return [
        CustomError.badRequest(
          `Invalid sortBy column '${sortBy}'. Allowed fields: ${validColumns.join(", ")}`,
        ),
      ];
    }

    return [
      undefined,
      new FilterExpenseDto({
        page: parsedPage,
        limit: parsedLimit,
        sortBy: sortBy,
        order: normalizedOrder as "ASC" | "DESC",
        name: name ? String(name).trim() : undefined,
        budgetId: budgetId,
        userId: userId,
      }),
    ];
  }

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}
