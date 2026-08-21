// Express handlers for Budget endpoints
import { IBudgetService } from "../services/interfaces/budget.service.interface";
import { CustomError } from "../errors/CustomError";
import {
  CreateBudgetDto,
  UpdateBudgetDto,
  FilterBudgetDto,
  GetBudgetByIdDto,
  BudgetResponseDto,
} from "../dtos";
import { BudgetIdRequest } from "../types/BudgetIdRequest";
import { AuthenticatedRequest } from "../types/auth/AuthenticatedRequest";
import { ApiResponse, TypedResponse } from "../types/ApiResponse";
import { Pagination } from "../types/Pagination";

export class BudgetController {
  private readonly budgetService: IBudgetService;

  public constructor(budgetService: IBudgetService) {
    this.budgetService = budgetService;
  }

  getAll = async (
    req: AuthenticatedRequest,
    res: TypedResponse<{ data: BudgetResponseDto[]; pagination: Pagination }>,
  ) => {
    try {
      const [error, filterBudgetDto] = FilterBudgetDto.create(
        req.query,
        req.userId,
      );
      if (error) throw error;
      const result: { data: BudgetResponseDto[]; pagination: Pagination } =
        await this.budgetService.getAllBudgets(filterBudgetDto);
      const response: ApiResponse<{
        data: BudgetResponseDto[];
        pagination: Pagination;
      }> = {
        ok: true,
        code: 200,
        data: result,
      };
      return res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  createBudget = async (
    req: AuthenticatedRequest,
    res: TypedResponse<BudgetResponseDto>,
  ) => {
    try {
      const [error, createBudgetDto] = CreateBudgetDto.create(
        req.body,
        req.userId,
      );
      if (error) throw error;

      const budget: BudgetResponseDto =
        await this.budgetService.createBudget(createBudgetDto);
      const response: ApiResponse<BudgetResponseDto> = {
        ok: true,
        code: 200,
        data: budget,
      };
      return res.status(201).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  getBudgetById = async (
    req: BudgetIdRequest,
    res: TypedResponse<BudgetResponseDto>,
  ) => {
    try {
      const budgetId = req.budgetId;
      const [error, getBudgetByIdDto] = GetBudgetByIdDto.create(
        { budgetId },
        req.userId,
      );
      if (error) throw error;
      const data: BudgetResponseDto =
        await this.budgetService.getBudgetById(getBudgetByIdDto);
      const response: ApiResponse<BudgetResponseDto> = {
        ok: true,
        code: 200,
        data,
      };
      return res.json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  updateBudgetById = async (
    req: BudgetIdRequest,
    res: TypedResponse<BudgetResponseDto>,
  ) => {
    try {
      const budgetId = req.budgetId;
      const [budgetError, updateBudgetDto] = UpdateBudgetDto.create(
        req.body,
        budgetId,
        req.userId,
      );
      if (budgetError) throw budgetError;
      const result: BudgetResponseDto =
        await this.budgetService.updateBudgetById(budgetId, updateBudgetDto);
      const response: ApiResponse<BudgetResponseDto> = {
        ok: true,
        code: 200,
        data: result,
      };

      return res.json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  deleteBudgetById = async (req: BudgetIdRequest, res: TypedResponse<BudgetResponseDto>) => {
    try {
      const [error, getBudgetByIdDto] = GetBudgetByIdDto.create(
        { budgetId: req.budgetId },
        req.userId,
      );
      if (error) throw error;
      const result: BudgetResponseDto =
        await this.budgetService.deleteBudgetById(getBudgetByIdDto);
      const response: ApiResponse<BudgetResponseDto> = {
        ok: true,
        code: 200,
        data: result,
      };
      return res.json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /** Handlers all errors thrown in any BudgetController handler  */
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
}
