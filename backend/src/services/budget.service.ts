import { IBudgetRepository } from "../repositories/interfaces/budget.repository.interface";
import { IBudgetService } from "./interfaces/budget.service.interface";
import { CustomError } from "../errors/CustomError";
import { BudgetMapper } from "../mappers/budget/budget.mapper";
import { GetBudgetByIdDto, CreateBudgetDto, BudgetResponseDto, UpdateBudgetDto, FilterBudgetDto } from "../dtos";
import { Pagination } from "../types/Pagination";


export class BudgetService implements IBudgetService {
  private readonly budgetRepository: IBudgetRepository;
  // DI: IBudgetRepository
  public constructor(budgetRepository: IBudgetRepository) {
    this.budgetRepository = budgetRepository;
  }

  createBudget = async (dto: CreateBudgetDto): Promise<BudgetResponseDto> => {
    try {
      const budget = await this.budgetRepository.createBudget(dto);
      return BudgetMapper.budgetEntityToBudgetResponseDto(budget);
    } catch (error) {
      throw CustomError.internalServer("Error creating budget");
    }
  };

  getAllBudgets = async (
    filterDto: FilterBudgetDto,
  ): Promise<{
    data: BudgetResponseDto[];
    pagination: Pagination;
  }> => {
    try {
      const result = await this.budgetRepository.getAllBudgets(filterDto);
      const budgets = result.data.map(
        BudgetMapper.budgetEntityToBudgetResponseDto,
      );
      return {
        data: budgets,
        pagination: result.pagination,
      };
    } catch (error) {
      throw CustomError.internalServer("Error fetching user budgets");
    }
  };

  getBudgetById = async (dto: GetBudgetByIdDto): Promise<BudgetResponseDto> => {
    try {
      const budget = await this.budgetRepository.getBudgetById(dto);
      // console.log({budget});
      if (!budget)
        throw new CustomError(
          404,
          `The budget with id '${dto.id}' was not found.`,
        ); //business rule, Services throw CustomError
      return BudgetMapper.budgetEntityToBudgetResponseDto(budget);
    } catch (error) {
      //console.log(error);
      if(error instanceof CustomError) throw error;
      throw CustomError.internalServer("Error fetching budget with id " + dto.id)
    }
  };

  updateBudgetById = async (
    id: number,
    updateBudgetDto: UpdateBudgetDto,
  ): Promise<BudgetResponseDto> => {
    try {
      const budget = await this.budgetRepository.updateBudgetById(updateBudgetDto);
      if (!budget) throw CustomError.notFound(`Budget with id '${id}' not found`);
      return BudgetMapper.budgetEntityToBudgetResponseDto(budget);
    } catch (error) {
      if(error instanceof CustomError) throw error;
      throw CustomError.internalServer("Error updating budget with id " + updateBudgetDto.id);
    }
  };

  deleteBudgetById = async (dto: GetBudgetByIdDto): Promise<BudgetResponseDto> => {
    try {
      const budget = await this.budgetRepository.deleteBudgetById(dto);
      if (!budget)
        throw CustomError.notFound(`Budget with id '${dto.id}' not found`);
      return BudgetMapper.budgetEntityToBudgetResponseDto(budget);
    } catch (error) {
      if(error instanceof CustomError) throw error;
      throw CustomError.internalServer("Error deleting budget with id " + dto.id);
    }
  };
}
