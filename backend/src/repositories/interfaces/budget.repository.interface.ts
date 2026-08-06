export abstract class IBudgetRepository {
    
    public abstract getAllBudgets(): Promise<string>;
    
    public abstract createBudget(): Promise<string>;
}