// Express handlers for Budget endpoints
import { type Request, type Response } from 'express';
import { IBudgetService } from '../services/interfaces/budget.service.interface';

export class BudgetController {

    private readonly budgetService: IBudgetService;

    public constructor(budgetService: IBudgetService
    ) {
        this.budgetService = budgetService;
    }
    //todo: add service & add re
    getAll = async (req: Request, res: Response) => {
        const result = await this.budgetService.getAllBudgets()
        return res.json({ result });

    }

    createBudget = async (req: Request, res: Response) => {
        const result = await this.budgetService.createBudget('');
        return res.json({ result });

    }
}