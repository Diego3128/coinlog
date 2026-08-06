import { Router, type Request, type Response } from "express";
import { BudgetController } from "../../controllers/budget.controller";
import { BudgetService } from "../../services/budget.service";
import { BudgetRepository } from "../../repositories/budget.repository";

export class BudgetRoutes {

    static get  routes(): Router{

        const router =  Router();

        const budgetRepository = new BudgetRepository(); //database interaction
        const budgetService = new BudgetService(budgetRepository); //business logic
        const budgetController = new BudgetController(budgetService); //handlers for specific routes

        router.get("/", budgetController.getAll);

        router.post("/", budgetController.createBudget);

        return router;
    }
}