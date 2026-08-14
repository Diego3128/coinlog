import { Request, Response, NextFunction } from "express";
import { GetExpenseByIdDto } from "../../dtos";
import { ExpenseIdRequest } from "../../types/ExpenseIdRequest";

export const validateExpenseId = (
  req: Request,
  res: Response,
  next: NextFunction,
  expenseIdValue: string,
) => {
  const [error, getExpenseByIdDto] = GetExpenseByIdDto.create({
    id: expenseIdValue,
  });

  if (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  (req as ExpenseIdRequest).expenseId = getExpenseByIdDto.id;
  next();
};
