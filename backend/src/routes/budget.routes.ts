import { Router} from "express";
import { BudgetController } from "../controllers/budget.controller";
import { BudgetRepository } from "../repositories/budget.repository";
import { BudgetService } from "../services/budget.service";

export class BudgetRoutes {

    static get  routes(): Router{

        const router =  Router();

        const budgetRepository = new BudgetRepository(); //database interaction
        const budgetService = new BudgetService(budgetRepository); //business logic
        const budgetController = new BudgetController(budgetService); //handlers for specific routes

        // routes are under the endpoint: '/budgets'
        router.get("/", budgetController.getAll);

        router.get("/:id", budgetController.getBudgetById);

        router.post("/", budgetController.createBudget);

        router.put("/:id", budgetController.updateBudgetById);

        router.delete("/:id", budgetController.deleteBudgetById);

        return router;
    }
}