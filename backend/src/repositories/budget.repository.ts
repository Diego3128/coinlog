import { IBudgetRepository } from "./interfaces/budget.repository.interface";


// todo: use sequelize

export class BudgetRepository implements IBudgetRepository{
    public getAllBudgets(): Promise<string> {
        return new Promise((r)=> r("get all budgets."));
    }
    public createBudget(): Promise<string> {
        return new Promise((r)=> r("create budget."));
    }

}