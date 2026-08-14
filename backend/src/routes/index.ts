import { Router } from "express";
import { BudgetRoutes } from "./budget.routes";
import { ExpenseRoutes } from "./expense.routes";

export class AppRoutes {

    //HERE ROUTES FROM OTHER MODULES ARE IMPORTED and set to the router

    static get  routes(): Router{

        const routes =  Router();

        routes.use("/budgets", BudgetRoutes.routes); 
        routes.use("/expenses", ExpenseRoutes.routes); 

        //routes.use(); //todo: add auth routes

        return routes;
    }
}