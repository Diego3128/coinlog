import { Request, Response, NextFunction } from "express";
import { ExpenseIdRequest } from "../../types/ExpenseIdRequest";
import { CustomError } from "../../errors/CustomError";
import { TypedResponse } from "../../types/ApiResponse";
import { AuthenticatedRequest } from "../../types/auth/AuthenticatedRequest";
import { GetExpenseByIdDto } from "../../dtos/expense/request/get-expense-by-id.dto";

export const validateExpenseId = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
  expenseIdValue: string,
) => {
  const [error, getExpenseByIdDto] = GetExpenseByIdDto.create(expenseIdValue, req.userId)

  if (error) {
    return handleError(error, res);
  }

  (req as ExpenseIdRequest).expenseId = getExpenseByIdDto.expenseId;
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
