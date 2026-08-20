import { type Request } from "express";
import { AuthenticatedRequest } from "./auth/AuthenticatedRequest";

/**
 * Must be used when validating the id with validateBudgetId middleware
*/
export interface BudgetIdRequest extends AuthenticatedRequest {
  budgetId: number;
}
