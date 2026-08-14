import { CreateExpenseDto, FilterExpenseDto, UpdateExpenseDto } from "../../dtos";
import Expense from "../../models/Expense";

export interface IExpenseRepository {
  getAllExpenses: (budgetId: number, filterDto: FilterExpenseDto) => Promise<{
    data: Expense[];
    pagination: {
      count: number;
      totalCount: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  }>;

  createExpense: (budgetId: number, data: CreateExpenseDto) => Promise<Expense>;

  getExpenseById: (id: number) => Promise<Expense>;

  updateExpenseById: (id: number, data: UpdateExpenseDto) => Promise<Expense>

  deleteExpenseById: (id: number) => Promise<boolean>;
}
