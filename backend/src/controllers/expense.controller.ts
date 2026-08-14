import { Request, Response } from "express";
import { ExpenseIdRequest } from "../types/ExpenseIdRequest";
import { CustomError } from "../errors/CustomError";
import { FilterExpenseDto, CreateExpenseDto, UpdateExpenseDto } from "../dtos";
import { IExpenseService } from "../services/interfaces/expense.service.interface";
import { BudgetIdRequest } from "../types/BudgetIdRequest";

export class ExpenseController {
  constructor(private readonly expenseService: IExpenseService) {}

  private handleError = (error: any, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  };

  getAll = async (req: BudgetIdRequest, res: Response) => {
    try {
      const budgetId = req.budgetId;
      const [error, filterDto] = FilterExpenseDto.create(req.query);
      if (error) throw error;

      const result = await this.expenseService.getAll(budgetId, filterDto);
      return res.json({ result });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  createExpense = async (req: BudgetIdRequest, res: Response) => {
    try {
      const budgetId = req.budgetId;

      const [error, createDto] = CreateExpenseDto.create(req.body);
      if (error) throw error;

      const expense = await this.expenseService.createExpense(
        budgetId,
        createDto,
      );
      return res.status(201).json(expense);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  getById = async (req: ExpenseIdRequest, res: Response) => {
    try {
      const data = await this.expenseService.getById(req.expenseId);
      return res.json( data);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  updateById = async (req: ExpenseIdRequest, res: Response) => {
    try {
      const [error, updateDto] = UpdateExpenseDto.create(req.body);
      if (error) throw error;

      const result = await this.expenseService.updateById(
        req.expenseId,
        updateDto,
      );
      return res.json( result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  deleteById = async (req: ExpenseIdRequest, res: Response) => {
    try {
      const result = await this.expenseService.deleteById(req.expenseId);
      return res.json( result );
    } catch (error) {
      this.handleError(error, res);
    }
  };
}
