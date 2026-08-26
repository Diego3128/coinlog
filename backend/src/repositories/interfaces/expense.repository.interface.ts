import { CreateExpenseDto, FilterExpenseDto, UpdateExpenseDto } from "../../dtos";
import { GetExpenseByIdDto } from "../../dtos/expense/request/get-expense-by-id.dto";
import Expense from "../../models/Expense";
import { Pagination } from "../../types/Pagination";

export interface IExpenseRepository {
  getAllExpenses: ( dto: FilterExpenseDto) => Promise<{
    data: Expense[];
    pagination: Pagination;
  }>;

  createExpense: (dto: CreateExpenseDto) => Promise<Expense>;

  getExpenseById: (id: number) => Promise<Expense>;

  updateExpenseById: (dto: UpdateExpenseDto) => Promise<Expense>

  deleteExpenseById: (dto: GetExpenseByIdDto) => Promise<boolean>;
}
