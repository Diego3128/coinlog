import { type Request } from "express";
import { AuthenticatedRequest } from "./auth/AuthenticatedRequest";

export interface ExpenseIdRequest extends AuthenticatedRequest {
  expenseId: number;
}