import { CustomError } from '../../errors/CustomError';
import Budget from '../../models/Budget';

export class FilterBudgetDto {
  private constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly sortBy: string,
    public readonly order: 'ASC' | 'DESC',
    public readonly name?: string
  ) {}

  static create(query: { [key: string]: any } = {}): [CustomError?, FilterBudgetDto?] {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'ASC', name } = query;

    // 1. Validate pagination
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    if (isNaN(parsedPage) || parsedPage <= 0) return [CustomError.badRequest('Page must be a positive integer')];
    if (isNaN(parsedLimit) || parsedLimit <= 0) return [CustomError.badRequest('Limit must be a positive integer')];

    // 2. Validate ordering (ASC or DESC)
    const normalizedOrder = String(order).toUpperCase();
    if (normalizedOrder !== 'ASC' && normalizedOrder !== 'DESC') {
      return [CustomError.badRequest('Order must be either ASC or DESC')];
    }

    // 3. Validate if the column exists in the sequelize model (Budget)
    const validColumns = Object.keys(Budget.getAttributes());
    if (!validColumns.includes(sortBy)) {
      return [
        CustomError.badRequest(
          `Invalid sortBy column '${sortBy}'. Allowed fields: ${validColumns.join(', ')}`
        ),
      ];
    }

    return [
      undefined,
      new FilterBudgetDto(
        parsedPage,
        parsedLimit,
        sortBy,
        normalizedOrder as 'ASC' | 'DESC',
        name ? String(name).trim() : undefined //optional name column for 'like' filter
      ),
    ];
  }

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}