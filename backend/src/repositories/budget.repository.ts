import { Op, WhereOptions } from "sequelize";
import { CreateBudgetDto } from "../dtos/budget/create-budget.dto";
import { FilterBudgetDto } from "../dtos/budget/filter-budget.dto";
import Budget, { BudgetAttributes } from "../models/Budget";
import { IBudgetRepository } from "./interfaces/budget.repository.interface";


export class BudgetRepository implements IBudgetRepository {
    getBudgetById: (id: number) => Promise<Budget | null>;
    updateBudgetById: (id: number, data?: any) => Promise<Budget | null>;
    deleteBudgetById: (id: number) => Promise<Budget>;

    createBudget = async (dto: CreateBudgetDto): Promise<Budget> => {
        return Budget.create({
            name: dto.name,
            amount: dto.amount
        });
    }

    getAllBudgets = async (filterDto: FilterBudgetDto): Promise<{
        data: Budget[];
        pagination: {
            count: number;
            totalCount: number;
            page: number;
            totalPages: number;
            limit: number
        }
    }> => {
        console.log("TODO: Agregar filtro para usuario autenticado");
        const where: WhereOptions<BudgetAttributes> = {};

        if (filterDto.name) {
            where.name = { [Op.iLike]: `%${filterDto.name}%` };
        }

        const { rows, count: totalCount } = await Budget.findAndCountAll({
            where,
            limit: filterDto.limit,
            offset: filterDto.offset,
            // Aplicación segura del orden dinámico
            order: [[filterDto.sortBy, filterDto.order]],
        });

        return {
            data: rows ?? [],
            pagination: {
                count: rows.length, //elements per page
                page: filterDto.page, //current page
                limit: filterDto.limit,
                totalPages: Math.ceil((totalCount / (filterDto.limit))),
                totalCount,
            }
        };
    };
}