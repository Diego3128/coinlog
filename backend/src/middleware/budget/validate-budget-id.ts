import { Request, Response, NextFunction } from 'express';
import { GetBudgetByIdDto } from '../../dtos/budget/get-budget-by-id.dto';
import { BudgetIdRequest } from '../../types/BudgetIdRequest';

export const validateBudgetId = (req: Request, res: Response, next: NextFunction, budgetIdValue: string) => {
  const [error, getBudgetByIdDto] = GetBudgetByIdDto.create({budgetId: budgetIdValue});

  if (error) {
      return res.status(error.statusCode).json({ error: error.message });
  }

  // Set parsed id to the request
  (req as BudgetIdRequest).budgetId = getBudgetByIdDto.id;
  next();
};