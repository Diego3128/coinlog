import { GetBudgetByIdDto } from "../../dtos";
import { CreateBudgetDto } from "../../dtos/budget/request/create-budget.dto";
import { FilterBudgetDto } from "../../dtos/budget/request/filter-budget.dto";
import { UpdateBudgetDto } from "../../dtos/budget/request/update-budget.dto";
import { BudgetResponseDto } from "../../dtos/budget/response/budget-response.dto";

export interface IBudgetService {
  getAllBudgets: (filterDto: FilterBudgetDto) => Promise<{
    data: BudgetResponseDto[];
    pagination: {
      count: number;
      totalCount: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  }>;

  createBudget: (data: CreateBudgetDto) => Promise<BudgetResponseDto>;

  getBudgetById: (dto: GetBudgetByIdDto) => Promise<BudgetResponseDto>;

  updateBudgetById: (id: number, updateDto: UpdateBudgetDto) => Promise<BudgetResponseDto>;

  deleteBudgetById: (dto: GetBudgetByIdDto) => Promise<BudgetResponseDto>;
}
