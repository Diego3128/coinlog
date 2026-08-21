import { GetBudgetByIdDto } from "../../dtos";
import { CreateBudgetDto } from "../../dtos/budget/request/create-budget.dto";
import { FilterBudgetDto } from "../../dtos/budget/request/filter-budget.dto";
import { UpdateBudgetDto } from "../../dtos/budget/request/update-budget.dto";
import Budget from "../../models/Budget";
import { Pagination } from "../../types/Pagination";

export interface IBudgetRepository {
    getAllBudgets: (filterDto: FilterBudgetDto) => Promise<{
        data: Budget[];
        pagination: Pagination
    }>;

    createBudget: (dto: CreateBudgetDto) => Promise<Budget>;

    getBudgetById: (dto: GetBudgetByIdDto) => Promise<Budget>;

    updateBudgetById: (dto: UpdateBudgetDto) => Promise<Budget>

    deleteBudgetById: (dto: GetBudgetByIdDto) => Promise<Budget | null>
}