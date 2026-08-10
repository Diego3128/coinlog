import { CreateBudgetDto } from "../dtos/budget/create-budget.dto";
import Budget from "../models/Budget";
import { IBudgetRepository } from "../repositories/interfaces/budget.repository.interface";
import { IBudgetService } from "./interfaces/budget.service.interface";
import { FilterBudgetDto } from "../dtos/budget/filter-budget.dto";
import { CustomError } from "../errors/CustomError";

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

  getBudgetById = async(id: number):  Promise<Budget> => {
    
    const budget = await this.budgetRepository.getBudgetById(id);
    if(!budget) throw new CustomError(404, `The budget with id '${id}' was not found.`); //business rule, Serives should throw CustomError
    return budget;
  };

  updateBudgetById: (id: number, data?: any) => Promise<Budget | null>;
  deleteBudgetById: (id: number) => Promise<Budget>;
}
