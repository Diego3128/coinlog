import { Request, Response, NextFunction } from "express";
import { GetBudgetByIdDto } from "../../dtos/budget/request/get-budget-by-id.dto";
import { BudgetIdRequest } from "../../types/BudgetIdRequest";
import { AuthenticatedRequest } from "../../types/auth/AuthenticatedRequest";
import { TypedResponse } from "../../types/ApiResponse";
import { CustomError } from "../../errors/CustomError";

export const validateBudgetId = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
  budgetIdValue: string,
) => {
  const [error, getBudgetByIdDto] = GetBudgetByIdDto.create(
    { budgetId: budgetIdValue },
    req.userId,
  );

  if (error) {
    return handleError(error, res);
  }

  // Set parsed id to the request
  (req as BudgetIdRequest).budgetId = getBudgetByIdDto.id;
  next();
};

const handleError = (error: any, res: TypedResponse<null>) => {
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
