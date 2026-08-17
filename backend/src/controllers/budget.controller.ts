// Express handlers for Budget endpoints
import { type Response } from 'express';
import { IBudgetService } from '../services/interfaces/budget.service.interface';
import { CustomError } from '../errors/CustomError';
import { CreateBudgetDto, UpdateBudgetDto, FilterBudgetDto } from '../dtos';
import { BudgetIdRequest } from '../types/BudgetIdRequest';
import { AuthenticatedRequest } from '../types/auth/AuthenticatedRequest';

export class BudgetController {

    private readonly budgetService: IBudgetService;

    public constructor(budgetService: IBudgetService
    ) {
        this.budgetService = budgetService;
    }
    getAll = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const [error, filterBudgetDto] = FilterBudgetDto.create(req.query);
            if(error) throw error;
            const data = await this.budgetService.getAllBudgets(filterBudgetDto)
            return res.status(200).json(data);
        } catch (error) {
            this.handleError(error, res);
        }

    }

    createBudget = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const [error, createBudgetDto] = CreateBudgetDto.create(req.body);
            if (error) throw error;

            const budget = await this.budgetService.createBudget(createBudgetDto);
            return res.status(201).json( budget);
        } catch (error) {
            this.handleError(error, res);
        }

    }

    getBudgetById = async (req: BudgetIdRequest, res: Response) => {
        try {
            const userId = req.userId;
            // console.log({userId});
            const budgetId = req.budgetId;
            const data = await this.budgetService.getBudgetById(budgetId);
            return res.json(data);
        } catch (error) {
            this.handleError(error, res);
        }

    }

    updateBudgetById = async (req: BudgetIdRequest, res: Response) => {
        try {
            const [budgetError, updateBudgetDto] = UpdateBudgetDto.create(req.body);
            const budgetId = req.budgetId;
            if (budgetError) throw budgetError;

            const result = await this.budgetService.updateBudgetById(budgetId, updateBudgetDto);
            return res.json( result );
        } catch (error) {
            this.handleError(error, res);
        }

    }

    deleteBudgetById = async (req: BudgetIdRequest, res: Response) => {
        try {
            const budgetId = req.budgetId;
            const result = await this.budgetService.deleteBudgetById(budgetId);
            return res.json( result );
        } catch (error) {
            this.handleError(error, res);
        }

    }

    /** Handlers all errors thrown in any BudgetController handlers  */
    handleError = (error: any, res: Response) => {
        console.log({ error });
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ error: error.message });
        } else {
            // return generic error
            return res.status(500).json({ error: "Unexpected server error. Try again later." });

        }
    }
}