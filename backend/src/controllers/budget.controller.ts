// Express handlers for Budget endpoints
import { type Request, type Response } from 'express';
import { IBudgetService } from '../services/interfaces/budget.service.interface';
import { GetBudgetByIdDto } from '../dtos/budget/get-budget-by-id.dto';
import { CustomError } from '../errors/CustomError';
import { CreateBudgetDto } from '../dtos/budget/create-budget.dto';
import { FilterBudgetDto } from '../dtos/budget/filter-budget.dto';
import { UpdateBudgetDto } from '../dtos/budget/update-budget.dto';

export class BudgetController {

    private readonly budgetService: IBudgetService;

    public constructor(budgetService: IBudgetService
    ) {
        this.budgetService = budgetService;
    }
    getAll = async (req: Request, res: Response) => {
        try {
            const [error, filterBudgetDto] = FilterBudgetDto.create(req.query);
            if(error) throw error;
            const data = await this.budgetService.getAllBudgets(filterBudgetDto)
            return res.status(200).json({ data });
        } catch (error) {
            this.handleError(error, res);
        }

    }

    createBudget = async (req: Request, res: Response) => {
        try {
            const [error, createBudgetDto] = CreateBudgetDto.create(req.body);
            if (error) throw error;

            const budget = await this.budgetService.createBudget(createBudgetDto);
            return res.status(201).json({ budget });
        } catch (error) {
            this.handleError(error, res);
        }

    }

    getBudgetById = async (req: Request, res: Response) => {
        try {
            const [error, getBudgetByIdDto] = GetBudgetByIdDto.create(req.params);
            if (error) throw error;
            const data = await this.budgetService.getBudgetById(getBudgetByIdDto.id);
            return res.json({ data });
        } catch (error) {
            this.handleError(error, res);
        }

    }

    updateBudgetById = async (req: Request, res: Response) => {
        try {
            const [idError, getBudgetByIdDto] = GetBudgetByIdDto.create(req.params);
            const [budgetError, updateBudgetDto] = UpdateBudgetDto.create(req.body);

            //todo: create DTO for the body
            if (idError) throw idError;
            if (budgetError) throw budgetError;

            console.log({idError, budgetError, getBudgetByIdDto, updateBudgetDto});

            const result = await this.budgetService.updateBudgetById(getBudgetByIdDto.id, updateBudgetDto);

            console.log({result});

            return res.json({ result });
        } catch (error) {
            this.handleError(error, res);
        }

    }

    deleteBudgetById = async (req: Request, res: Response) => {
        try {
            const [error, getBudgetByIdDto] = GetBudgetByIdDto.create(req.params);
            if (error) throw error;
            const result = await this.budgetService.deleteBudgetById(getBudgetByIdDto.id);
            return res.json({ result });
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