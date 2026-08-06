import { IBudgetRepository } from "../repositories/interfaces/budget.repository.interface";
import { IBudgetService } from "./interfaces/budget.service.interface";

export class BudgetService implements IBudgetService {

    private readonly budgetRepository: IBudgetRepository
    // DI: IBudgetRepository
    public constructor(
        budgetRepository: IBudgetRepository
    ) {
        this.budgetRepository = budgetRepository;
    }

    getAllBudgets = async (): Promise<string> => {
        //business logic
        return await this.budgetRepository.getAllBudgets()
    }

    createBudget = async (): Promise<string> => {
        //business logic
        return await this.budgetRepository.createBudget();
    }


}