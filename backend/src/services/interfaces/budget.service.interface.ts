import { CreateBudgetDto } from "../../dtos/budget/create-budget.dto";
import { FilterBudgetDto } from "../../dtos/budget/filter-budget.dto";
import Budget from "../../models/Budget";

export interface IBudgetService {
  getAllBudgets: (filterDto: FilterBudgetDto) => Promise<{
    data: Budget[];
    pagination: {
      count: number;
      totalCount: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  }>;
  createBudget: (data: CreateBudgetDto) => Promise<Budget>;
  getBudgetById: (id: number) => Promise<Budget | null>;
  updateBudgetById: (id: number, data?: any) => Promise<Budget | null>;
  deleteBudgetById: (id: number) => Promise<Budget>;
}
