import { Router} from "express";
import { BudgetController } from "../controllers/budget.controller";
import { BudgetRepository } from "../repositories/budget.repository";
import { BudgetService } from "../services/budget.service";
import { validateBudgetId } from "../middleware/budget/validate-budget-id";

export class BudgetRoutes {

    static get  routes(): Router{

        const router =  Router();

        const budgetRepository = new BudgetRepository(); //database interaction
        const budgetService = new BudgetService(budgetRepository); //business logic
        const budgetController = new BudgetController(budgetService); //handlers for specific routes

        //validates the budgetId when present in the request
        router.param("budgetId", validateBudgetId);

        // routes are under the endpoint: '/budgets'
        router.get("/", budgetController.getAll);

        router.get("/:budgetId", budgetController.getBudgetById);

        router.post("/", budgetController.createBudget);

        router.put("/:budgetId", budgetController.updateBudgetById);

        router.delete("/:budgetId", budgetController.deleteBudgetById);

        return router;
    }
}