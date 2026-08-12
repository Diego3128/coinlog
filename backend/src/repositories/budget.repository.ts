import { Op, WhereOptions } from "sequelize";
import { CreateBudgetDto } from "../dtos/budget/create-budget.dto";
import { FilterBudgetDto } from "../dtos/budget/filter-budget.dto";
import Budget, { BudgetAttributes } from "../models/Budget";
import { IBudgetRepository } from "./interfaces/budget.repository.interface";
import { UpdateBudgetDto } from "../dtos/budget/update-budget.dto";

export class BudgetRepository implements IBudgetRepository {
  getBudgetById = (id: number): Promise<Budget> => {
    console.log("TODO:  getBudgetById Agregar filtro para usuario autenticado");
    // const budget = Budget.findOne({where: { id: id }});
    const budget = Budget.findByPk(id);
    return budget;
  };

  createBudget = async (dto: CreateBudgetDto): Promise<Budget> => {
    return Budget.create({
      name: dto.name,
      amount: dto.amount,
    });
  };

  getAllBudgets = async (
    filterDto: FilterBudgetDto,
  ): Promise<{
    data: Budget[];
    pagination: {
      count: number;
      totalCount: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  }> => {
    console.log("TODO: getAllBudgets Agregar filtro para usuario autenticado");
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
        totalPages: Math.ceil(totalCount / filterDto.limit),
        totalCount,
      },
    };
  };

  updateBudgetById = async (
    id: number,
    data: UpdateBudgetDto,
  ): Promise<Budget> => {
    console.log(
      "TODO: updateBudgetById() When having the users, check if the budget exists first and if it belongs to the user",
    );
    const newValues = data.values;
    // const budget = Budget.findOne({where: {id: id, userId: userId}});
    const budget = await Budget.findByPk(id);
    if (!budget) return null;
    await budget.update(newValues);
    return budget;
  };

  deleteBudgetById = async (id: number): Promise<Budget> => {
    const budget = await Budget.findByPk(id);
    if (budget) {
      await budget.destroy();
    }
    return budget || null;
  };
}
