import { ColoredLog } from "../config/adapters/colors.adapter";
import { FilterExpenseDto, CreateExpenseDto, UpdateExpenseDto } from "../dtos";
import { CustomError } from "../errors/CustomError";
import Expense from "../models/Expense";
import { IExpenseRepository } from "../repositories/interfaces/expense.repository.interface";
import { IBudgetService } from "./interfaces/budget.service.interface";
import { IExpenseService } from "./interfaces/expense.service.interface";

export class ExpenseService implements IExpenseService {
  constructor(
    private readonly expenseRepository: IExpenseRepository,
    private readonly budgetService: IBudgetService,
  ) {}

  getAll = async (
    budgetId: number,
    filterDto: FilterExpenseDto,
  ): Promise<{
    data: Expense[];
    pagination: {
      count: number;
      totalCount: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  }> => {
    ColoredLog.error(
      "TODO: Include additional validation for the authenticated user",
    );

    return await this.expenseRepository.getAllExpenses(budgetId, filterDto);
  };

  createExpense = async (
    budgetId: number,
    createExpenseDto: CreateExpenseDto,
  ): Promise<Expense> => {
    ColoredLog.error(
      "TODO: Include additional validation for the authenticated user",
    );
    try {
      //validates if exists //throws CustomError 404
      await this.budgetService.getBudgetById(budgetId);
      const expense = await this.expenseRepository.createExpense(
        budgetId,
        createExpenseDto,
      );
      return expense;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else
        throw new CustomError(
          500,
          "Error creating a new expense. Try again later",
        );
    }
  };

  getById = async (id: number): Promise<Expense> => {
    ColoredLog.error(
      "TODO: Include additional validation for the authenticated user",
    );
    const expense = await this.expenseRepository.getExpenseById(id);
    if (!expense) throw CustomError.notFound(`Expense with id ${id} not found`);
    return expense;
  };

  updateById = async (
    id: number,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> => {
    ColoredLog.error(
      "TODO: Include additional validation for the authenticated user",
    );
    const expense = await this.expenseRepository.updateExpenseById(
      id,
      updateExpenseDto,
    );
    if (!expense) throw CustomError.notFound(`Expense with id ${id} not found`);
    return expense;
  };

  deleteById = async (id: number): Promise<{ message: string }> => {
    ColoredLog.error(
      "TODO: Include additional validation for the authenticated user",
    );

    const destroyed = await this.expenseRepository.deleteExpenseById(id);
    if (!destroyed) throw CustomError.notFound(`Expense with id ${id} not found`);
    return { message: `Expense ${id} deleted successfully` };
  };
}
