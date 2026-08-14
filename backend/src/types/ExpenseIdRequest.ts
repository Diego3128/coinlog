import { type Request } from "express";

export interface ExpenseIdRequest extends Request {
  expenseId: number;
}