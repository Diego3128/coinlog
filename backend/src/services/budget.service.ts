import { CreateBudgetDto } from "../dtos/budget/create-budget.dto";
import Budget from "../models/Budget";
import { IBudgetRepository } from "../repositories/interfaces/budget.repository.interface";
import { IBudgetService } from "./interfaces/budget.service.interface";
import { FilterBudgetDto } from "../dtos/budget/filter-budget.dto";
import { CustomError } from "../errors/CustomError";
import { UpdateBudgetDto } from "../dtos/budget/update-budget.dto";

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

  getBudgetById = async (id: number): Promise<Budget> => {
    const budget = await this.budgetRepository.getBudgetById(id);
    if (!budget)
      throw new CustomError(404, `The budget with id '${id}' was not found.`); //business rule, Services throw CustomError
    return budget;
  };

  updateBudgetById = async (
    id: number,
    updateBudgetDto: UpdateBudgetDto,
  ): Promise<Budget> => {
    try {
      //business rule. check if budget exists
      const budget = await this.budgetRepository.updateBudgetById(
        id,
        updateBudgetDto,
      );
      if (!budget) throw CustomError.notFound(`Budget with id '${id}' not found`);
      return budget;
    } catch (error) {
      // console.log({ error });
      throw error;
    }
  };

  deleteBudgetById: (id: number) => Promise<Budget>;
}
