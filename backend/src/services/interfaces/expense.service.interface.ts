import { CreateExpenseDto, UpdateExpenseDto } from "../../dtos";
import { FilterBudgetDto } from "../../dtos/budget/filter-budget.dto";
import Expense from "../../models/Expense";

export interface IExpenseService {
  getAll: (budgetId: number, filterDto: FilterBudgetDto) => Promise<{
    data: Expense[];
    pagination: {
      count: number;
      totalCount: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  }>;

  getById: (id: number) => Promise<Expense>;

  createExpense: (budgetId: number, createExpenseDto: CreateExpenseDto) => Promise<Expense>;

  updateById: (
    id: number,
    updateExpenseDto: UpdateExpenseDto,
  ) => Promise<Expense>;

  deleteById: (id: number) => Promise<{ message: string }>;
}
