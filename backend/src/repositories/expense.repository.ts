import { Op, WhereOptions } from "sequelize";
import Expense, { ExpenseAttributes } from "../models/Expense";
import Budget from "../models/Budget";
import { IExpenseRepository } from "./interfaces/expense.repository.interface";
import { UpdateExpenseDto, CreateExpenseDto, FilterExpenseDto } from "../dtos";
import { GetExpenseByIdDto } from "../dtos/expense/request/get-expense-by-id.dto";

export class ExpenseRepository implements IExpenseRepository {
  createExpense = async (
    dto: CreateExpenseDto,
  ): Promise<Expense> => {
    return await Expense.create({
      name: dto.name,
      amount: dto.amount,
      budgetId: dto.budgetId,
    });
  };

  getAllExpenses = async (dto: FilterExpenseDto) => {
    const where: WhereOptions<ExpenseAttributes> = {};

    where.budgetId = dto.budgetId; //mandatory

    if (dto.name) {
      where.name = { [Op.iLike]: `%${dto.name}%` };
    }

    const { rows, count: totalCount } = await Expense.findAndCountAll({
      where,
      limit: dto.limit,
      offset: dto.offset,
      order: [[dto.sortBy, dto.order]],
      // include: [{ model: Budget, attributes: ["id", "name"] }],
    });

    return {
      data: rows ?? [],
      pagination: {
        count: rows.length,
        totalPages: Math.ceil(totalCount / dto.limit) || 0,
        totalCount,
        page: dto.page,
        limit: dto.limit,
      },
    };
  };

  getExpenseById = async (id: number): Promise<Expense | null> => {
    return await Expense.findByPk(id, {
      include: [{ model: Budget, attributes: ["id", "name", "amount"] }],
    });
  };

  updateExpenseById = async (
    dto: UpdateExpenseDto,
  ): Promise<Expense | null> => {
    const expense = await Expense.findByPk(dto.expenseId, {
      // include: [{ model: Budget, attributes: ["id", "name", "amount"] }],
    });
    await expense.update(dto.values);
    return expense;
  };

  deleteExpenseById = async (dto: GetExpenseByIdDto): Promise<boolean> => {
    const count = await Expense.destroy({ where: { id: dto.expenseId } });
    return count > 0;
  };
}
