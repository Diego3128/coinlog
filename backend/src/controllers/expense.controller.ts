import { ExpenseIdRequest } from "../types/ExpenseIdRequest";
import { CustomError } from "../errors/CustomError";
import { IExpenseService } from "../services/interfaces/expense.service.interface";
import { BudgetIdRequest } from "../types/BudgetIdRequest";
import { CreateExpenseDto, FilterExpenseDto, UpdateExpenseDto } from "../dtos";
import { ExpenseResponseDto } from "../dtos/expense/response/expense-response.dto";
import { ApiResponse, TypedResponse } from "../types/ApiResponse";
import { Pagination } from "../types/Pagination";
import { GetExpenseByIdDto } from "../dtos/expense/request/get-expense-by-id.dto";


export class ExpenseController {
  constructor(private readonly expenseService: IExpenseService) {}

  /** Handles all errors thrown in any ExpenseController handler  */
  private handleError = (error: any, res: TypedResponse<null>) => {
    // console.log(error);
    if (error instanceof CustomError) {
      return res
        .status(error.statusCode)
        .json({ error: error.message, ok: false, code: error.statusCode });
    }
    return res
      .status(500)
      .json({ error: "Internal Server Error", ok: false, code: 500 });
  };

  getAll = async (
    req: BudgetIdRequest,
    res: TypedResponse<{ data: ExpenseResponseDto[]; pagination: Pagination }>,
  ) => {
    try {
      const budgetId = req.budgetId;
      const [error, filterDto] = FilterExpenseDto.create(
        req.query,
        budgetId,
        req.userId,
      );
      if (error) throw error;

      const result: {
        data: ExpenseResponseDto[];
        pagination: Pagination;
      } = await this.expenseService.getAll(filterDto);

      const response: ApiResponse<{
        data: ExpenseResponseDto[];
        pagination: Pagination;
      }> = { code: 200, ok: true, data: result };

      return res.json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  createExpense = async (
    req: BudgetIdRequest,
    res: TypedResponse<ExpenseResponseDto>,
  ) => {
    try {
      const [error, createDto] = CreateExpenseDto.create(
        req.body,
        req.budgetId,
        req.userId,
      );
      if (error) throw error;

      const expense: ExpenseResponseDto =
        await this.expenseService.createExpense(createDto);
      const response: ApiResponse<ExpenseResponseDto> = {
        ok: true,
        code: 201,
        data: expense,
      };
      return res.status(201).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  getById = async (req: ExpenseIdRequest, res: TypedResponse<ExpenseResponseDto>) => {
    try {
      const [error, getExpenseByIdDto] = GetExpenseByIdDto.create(req.expenseId, req.userId);
      if(error) throw error;
      const data: ExpenseResponseDto = await this.expenseService.getById(getExpenseByIdDto);
      const response: ApiResponse<ExpenseResponseDto> = {code: 200, ok: true, data}
      return res.json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  updateById = async (req: ExpenseIdRequest, res: TypedResponse<ExpenseResponseDto>) => {
    try {
      const [error, updateDto] = UpdateExpenseDto.create(req.body, req.expenseId, req.userId);
      if (error) throw error;
      const result = await this.expenseService.updateById(updateDto);
      const response: ApiResponse<ExpenseResponseDto> = {code: 200, ok: true, data: result}
      return res.json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  deleteById = async (req: ExpenseIdRequest, res: TypedResponse<{success: boolean}>) => {
    try {
      const [error, getExpenseByIdDto] = GetExpenseByIdDto.create(req.expenseId, req.userId);
      if(error) throw error;
      const result = await this.expenseService.deleteById(getExpenseByIdDto);
      const response: ApiResponse<{success: boolean}> = {code: 200, ok: true, data: result}
      return res.json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  };
}
