import { CreateExpenseDto, UpdateExpenseDto } from "../../dtos";
import { FilterBudgetDto } from "../../dtos/budget/request/filter-budget.dto";
import { GetExpenseByIdDto } from "../../dtos/expense/request/get-expense-by-id.dto";
import { ExpenseResponseDto } from "../../dtos/expense/response/expense-response.dto";
import { Pagination } from "../../types/Pagination";

export interface IExpenseService {
  getAll: ( filterDto: FilterBudgetDto) => Promise<{
    data: ExpenseResponseDto[];
    pagination: Pagination;
  }>;

  getById: (dto: GetExpenseByIdDto) => Promise<ExpenseResponseDto>;

  createExpense: (dto: CreateExpenseDto) => Promise<ExpenseResponseDto>;

  updateById: (updateExpenseDto: UpdateExpenseDto) => Promise<ExpenseResponseDto>;

  deleteById: (dto: GetExpenseByIdDto) => Promise<{ success: boolean }>;
}
