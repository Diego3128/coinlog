import {
  FilterExpenseDto,
  CreateExpenseDto,
  UpdateExpenseDto,
} from "../dtos";
import { GetExpenseByIdDto } from "../dtos/expense/request/get-expense-by-id.dto";
import { ExpenseResponseDto } from "../dtos/expense/response/expense-response.dto";
import { CustomError } from "../errors/CustomError";
import { ExpenseMapper } from "../mappers/expense/expense.mapper";
import Expense from "../models/Expense";
import { IExpenseRepository } from "../repositories/interfaces/expense.repository.interface";
import { Pagination } from "../types/Pagination";
import { IBudgetService } from "./interfaces/budget.service.interface";
import { IExpenseService } from "./interfaces/expense.service.interface";

export class ExpenseService implements IExpenseService {
  constructor(
    private readonly expenseRepository: IExpenseRepository,
    private readonly budgetService: IBudgetService,
  ) {}

  getAll = async (
    filterDto: FilterExpenseDto,
  ): Promise<{
    data: ExpenseResponseDto[];
    pagination: Pagination;
  }> => {
    try {
      //check if user owns this budget. //throws 404
      await this.budgetService.getBudgetById({
        id: filterDto.budgetId,
        userId: filterDto.userId,
      }); //throws 404

      const result = await this.expenseRepository.getAllExpenses(filterDto);
      const expenses = result.data.map(
        ExpenseMapper.expenseEntityToExpenseResponseDto,
      );
      return { data: expenses, pagination: result.pagination };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer("Error fetching expenses");
    }
  };

  createExpense = async (
    dto: CreateExpenseDto,
  ): Promise<ExpenseResponseDto> => {
    try {
      //validates if budget exists & belongs to current user
      const existingBudget = await this.budgetService.getBudgetById({
        id: dto.budgetId,
        userId: dto.userId,
      }); //throws CustomError 404
      if (!existingBudget) {
        throw CustomError.conflict("Error assigning expense to budget");
      }
      const expense = await this.expenseRepository.createExpense(dto);
      return ExpenseMapper.expenseEntityToExpenseResponseDto(expense);
    } catch (error) {
      // console.log(error);
      if (error instanceof CustomError) {
        throw error;
      } else
        throw new CustomError(
          500,
          "Error creating a new expense. Try again later",
        );
    }
  };

  getById = async (dto: GetExpenseByIdDto): Promise<ExpenseResponseDto> => {
    try {
      //get expense
      const expense = await this.expenseRepository.getExpenseById(dto.expenseId);
      if (!expense)
        throw CustomError.notFound(
          `The expense with id '${dto.expenseId}' was not found`,
        );
      //get budget by id
      //checks if the expense belongs to authenticated user //throws 404
      await this.budgetService.getBudgetById({
        id: expense.budgetId,
        userId: dto.userId,
      });

      return ExpenseMapper.expenseEntityToExpenseResponseDto(expense);
    } catch (error) {
      if (error instanceof CustomError && error.statusCode === 404) {
        //done to re-write error of 404 for budget
        throw CustomError.notFound(
          `The expense with id '${dto.expenseId}' was not found`,
        );
      }
      throw CustomError.internalServer(
        "Error fetching the expense with id " + dto.expenseId,
      );
    }
  };

  updateById = async (dto: UpdateExpenseDto): Promise<ExpenseResponseDto> => {
    try {
      //throws on error || if expense does not belong to authenticated user, not found, etc..
      await this.getById({expenseId: dto.expenseId,userId: dto.userId});
      //update
      const result = await this.expenseRepository.updateExpenseById(dto);
      return ExpenseMapper.expenseEntityToExpenseResponseDto(result);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(
        "Error updating the expense with id " + dto.expenseId,
      );
    }
  };

  deleteById = async (dto: GetExpenseByIdDto): Promise<{ success: boolean }> => {
    try {
      //throws on error || if expense does not belong to authenticated user, not found, etc..
      await this.getById({ expenseId: dto.expenseId, userId: dto.userId }); //throws on error
      const destroyed = await this.expenseRepository.deleteExpenseById(dto);
      return { success: destroyed };
    } catch (error) {
       if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(
        "Error deleting the expense with id " + dto.expenseId,
      );
    }
  };
}
