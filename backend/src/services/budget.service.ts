import { CreateBudgetDto } from "../dtos/budget/create-budget.dto";
import Budget from "../models/Budget";
import { IBudgetRepository } from "../repositories/interfaces/budget.repository.interface";
import { IBudgetService } from "./interfaces/budget.service.interface";
import { FilterBudgetDto } from "../dtos/budget/filter-budget.dto";

export class BudgetService implements IBudgetService {
  private readonly budgetRepository: IBudgetRepository;
  // DI: IBudgetRepository
  public constructor(budgetRepository: IBudgetRepository) {
    this.budgetRepository = budgetRepository;
  }

  createBudget = async (data: CreateBudgetDto): Promise<Budget> => {
    return await this.budgetRepository.createBudget(data);
  };

  getAllBudgets = async (
    filterDto: FilterBudgetDto,
  ): Promise<{
    data: Budget[];
    pagination: {
      count: number;
      totalCount: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  }> => {
    //business logic
    return await this.budgetRepository.getAllBudgets(filterDto);
  };

  getBudgetById: (id: number) => Promise<Budget | null>;

  updateBudgetById: (id: number, data?: any) => Promise<Budget | null>;
  deleteBudgetById: (id: number) => Promise<Budget>;
}
