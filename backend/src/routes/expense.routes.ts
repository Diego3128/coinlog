import { Router } from "express";
import { ExpenseController } from "../controllers/expense.controller";
import { ExpenseRepository } from "../repositories/expense.repository";
import { ExpenseService } from "../services/expense.service";
import { validateExpenseId } from "../middleware/expense/validate-expense-id.middleware";
import { IExpenseRepository } from "../repositories/interfaces/expense.repository.interface";
import { IExpenseService } from "../services/interfaces/expense.service.interface";
import { validateBudgetId } from "../middleware/budget/validate-budget-id";
import { IBudgetRepository } from "../repositories/interfaces/budget.repository.interface";
import { BudgetRepository } from "../repositories/budget.repository";
import { IBudgetService } from "../services/interfaces/budget.service.interface";
import { BudgetService } from "../services/budget.service";

export class ExpenseRoutes {
  static get routes(): Router {
    const router = Router();

    const budgetRepository: IBudgetRepository = new BudgetRepository();
    const budgetService: IBudgetService = new BudgetService(budgetRepository); // DI in ExpenseService

    const expenseRepository: IExpenseRepository = new ExpenseRepository();
    const expenseService: IExpenseService = new ExpenseService(expenseRepository, budgetService);
    const expenseController = new ExpenseController(expenseService);

    // Validate expenseId when present in the request url
    router.param("expenseId", validateExpenseId);
    // Validate budgetId when present in the request url
    router.param("budgetId", validateBudgetId);

    // routes under '/api/v1/expenses'

    //budget related
    router.get("/budget/:budgetId", expenseController.getAll); //get all expenses belonging to a budget
    router.post("/budget/:budgetId", expenseController.createExpense); // create a new expense in a budget

    //no budgetId  needed // operations for a specific expense
    router.get("/:expenseId", expenseController.getById);
    router.put("/:expenseId", expenseController.updateById);
    router.delete("/:expenseId", expenseController.deleteById);

    return router;
  }
}