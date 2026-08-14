import { Op, WhereOptions } from "sequelize";
import Expense, { ExpenseAttributes } from "../models/Expense";
import Budget from "../models/Budget";
import { CreateExpenseDto } from "../dtos/expense/create-expense.dto";
import { UpdateExpenseDto } from "../dtos/expense/update-expense.dto";
import { FilterExpenseDto } from "../dtos/expense/filter-expense.dto";
import { IExpenseRepository } from "./interfaces/expense.repository.interface";

export class ExpenseRepository implements IExpenseRepository {
  createExpense = async (
    budgetId: number,
    createExpenseDto: CreateExpenseDto,
  ): Promise<Expense> => {
    return await Expense.create({
      name: createExpenseDto.name,
      amount: createExpenseDto.amount,
      budgetId: budgetId,
    });
  };

  getAllExpenses = async (budgetId: number, filterDto: FilterExpenseDto) => {
    const where: WhereOptions<ExpenseAttributes> = {};

    where.budgetId = budgetId; //mandatory
    //TODO: and where for the authenticated user

    if (filterDto.name) {
      where.name = { [Op.iLike]: `%${filterDto.name}%` };
    }

    const { rows, count: totalCount } = await Expense.findAndCountAll({
      where,
      limit: filterDto.limit,
      offset: filterDto.offset,
      order: [[filterDto.sortBy, filterDto.order]],
      // include: [{ model: Budget, attributes: ["id", "name"] }],
    });

    return {
      data: rows ?? [],
      pagination: {
        count: rows.length,
        totalPages: Math.ceil(totalCount / filterDto.limit) || 0,
        totalCount,
        page: filterDto.page,
        limit: filterDto.limit,
      },
    };
  };

  getExpenseById = async (id: number): Promise<Expense | null> => {
    return await Expense.findByPk(id, {
      include: [{ model: Budget, attributes: ["id", "name", "amount"] }],
    });
  };

  updateExpenseById = async (
    id: number,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense | null> => {
    const expense = await Expense.findByPk(id, {
      include: [{ model: Budget, attributes: ["id", "name", "amount"] }],
    });

    if (!expense) return null;

    await expense.update(updateExpenseDto.values);
    return expense;
  };

  deleteExpenseById = async (id: number): Promise<boolean> => {
    const count = await Expense.destroy({ where: { id } });
    return count > 0;
  };
}
