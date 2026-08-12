import { type Request } from "express";

/**
 * Must be used when validating the id with validateBudgetId middleware
*/
export interface BudgetIdRequest extends Request {
  budgetId: number;
}
