export abstract class IBudgetService {

    public abstract getAllBudgets(): Promise<string>;

    public abstract createBudget(data: any): Promise<string>;

}