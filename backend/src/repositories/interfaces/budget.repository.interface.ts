import { CreateBudgetDto } from "../../dtos/budget/create-budget.dto";
import { FilterBudgetDto } from "../../dtos/budget/filter-budget.dto";
import { UpdateBudgetDto } from "../../dtos/budget/update-budget.dto";
import Budget from "../../models/Budget";

export interface IBudgetRepository {
    getAllBudgets: (filterDto: FilterBudgetDto) => Promise<{
        data: Budget[];
        pagination: {
            count: number;
            totalCount: number;
            page: number;
            totalPages: number;
            limit: number
        }
    }>;

    createBudget: (data: CreateBudgetDto) => Promise<Budget>;

    getBudgetById: (id: number) => Promise<Budget>;

    updateBudgetById: (id: number, data: UpdateBudgetDto) => Promise<Budget>

    deleteBudgetById: (id: number) => Promise<Budget | null>
}