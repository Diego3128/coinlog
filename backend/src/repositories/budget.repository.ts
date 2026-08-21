import { Op, WhereOptions } from "sequelize";
import { CreateBudgetDto } from "../dtos/budget/request/create-budget.dto";
import { FilterBudgetDto } from "../dtos/budget/request/filter-budget.dto";
import Budget, { BudgetAttributes } from "../models/Budget";
import { IBudgetRepository } from "./interfaces/budget.repository.interface";
import { UpdateBudgetDto } from "../dtos/budget/request/update-budget.dto";
import { GetBudgetByIdDto } from "../dtos";
import { Pagination } from "../types/Pagination";

export class BudgetRepository implements IBudgetRepository {
  getBudgetById = async (dto: GetBudgetByIdDto): Promise<Budget> => {
    const budget = await Budget.findOne({where: { id: dto.id, userId: dto.userId}});
    return budget;
  };

  createBudget = async (dto: CreateBudgetDto): Promise<Budget> => {
    return Budget.create({
      name: dto.name,
      amount: dto.amount,
      userId: dto.userId
    });
  };

  getAllBudgets = async (
    filterDto: FilterBudgetDto,
  ): Promise<{
    data: Budget[];
    pagination: Pagination;
  }> => {
    const where: WhereOptions<BudgetAttributes> = {};

    if (filterDto.name) {
      where.name = { [Op.iLike]: `%${filterDto.name}%` };
    }

    where.userId = filterDto.userId;

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
        totalPages: Math.ceil(totalCount / filterDto.limit),
        totalCount,
      },
    };
  };

  updateBudgetById = async (
    dto: UpdateBudgetDto,
  ): Promise<Budget | null> => {

    const newValues = dto.values;
    const budget = await Budget.findOne({where: {id: dto.id, userId: dto.userId}})
    if (!budget) return null;
    await budget.update(newValues);
    return budget;
  };

  deleteBudgetById = async (dto: GetBudgetByIdDto): Promise<Budget> => {
    const budget = await Budget.findOne({where: {id: dto.id, userId: dto.userId}})
    if (budget) {
      await budget.destroy();
    }
    return budget || null;
  };
}
