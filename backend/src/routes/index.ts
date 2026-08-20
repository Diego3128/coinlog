import { Router } from "express";
import { BudgetRoutes } from "./budget.routes";
import { ExpenseRoutes } from "./expense.routes";
import { AuthRoutes } from "./auth.routes";
import { ValidateJWT } from "../middleware/auth/validate-access-token.middleware";

export class AppRoutes {

    //HERE ROUTES FROM OTHER MODULES ARE IMPORTED and set to the router

    static get  routes(): Router{

        const routes =  Router();

        routes.use("/budgets", ValidateJWT.validateAccessToken, BudgetRoutes.routes); 
        routes.use("/expenses", ValidateJWT.validateAccessToken, ExpenseRoutes.routes); 
        routes.use("/auth", AuthRoutes.routes); 

        //routes.use(); //todo: add auth routes

        return routes;
    }
}