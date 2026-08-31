import { IExpenseRepository } from "../../../repositories/interfaces/expense.repository.interface";
import Budget from "../../../models/Budget";
import Expense from "../../../models/Expense";
import User from "../../../models/User";
import RefreshToken from "../../../models/RefreshToken";
import { Sequelize } from "sequelize-typescript";
import { ExpenseRepository } from "../../../repositories/expense.repository";
import { CreateExpenseDto, FilterExpenseDto, GetExpenseByIdDto, UpdateExpenseDto } from "../../../dtos";

describe("ExpenseRepository", () => {
  let testSequelize: Sequelize;
  let expenseRepository: IExpenseRepository;
  let user: User;
  let testBudget: Budget;

  beforeAll(async () => {
    testSequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      models: [Budget, Expense, User, RefreshToken],
    });

    await testSequelize.sync({ force: true });
    expenseRepository = new ExpenseRepository();
  });

  beforeEach(async () => {
    //create a user for the foreign relationship
    user = await User.create({
      firstName: "test",
      lastName: "test lastname",
      username: "test",
      email: "test@gmail.com",
      password: "hashedpass",
      confirmed: true,
    });

    testBudget = await Budget.create({
      name: "budget test",
      amount: 200,
      userId: user.id,
    });
  });

  // clean  all used tables after each test
  afterEach(async () => {
    await Budget.destroy({ truncate: true });
    await Expense.destroy({ truncate: true });
    await User.destroy({ truncate: true });
  });

  // close connection when all tests have finished
  afterAll(async () => {
    await testSequelize.close();
  });

  describe("createExpense", () => {
    it("should return a sequelize Expense object", async () => {
      //arrange
      const dto: CreateExpenseDto = {
        name: "expense test",
        amount: 100,
        budgetId: testBudget.id,
        userId: user.id,
      };
      //act
      const result: Expense = await expenseRepository.createExpense(dto);
      expect(result.budgetId).toBe(testBudget.id);
      expect(result.name).toBe(dto.name);
      expect(result.amount).toBe(dto.amount);
    });
  });
  //
  describe("getAllExpenses", () => {
    beforeEach(async () => {
      // Create several expenses
      await Expense.bulkCreate([
        { name: "Coffee", amount: 5, budgetId: testBudget.id },
        { name: "Coffee beans", amount: 15, budgetId: testBudget.id },
        { name: "Supermarket", amount: 100, budgetId: testBudget.id },
      ]);
    });

    it("should return all expenses belonging to the budget with pagination", async () => {
      // Arrange
      const dto: FilterExpenseDto = {
        budgetId: testBudget.id,
        userId: user.id,
        page: 1,
        limit: 10,
        offset: 0,
        sortBy: "createdAt",
        order: "DESC",
      };

      
      // Act
      const result = await expenseRepository.getAllExpenses(dto);

      // Assert
      expect(result.data).toHaveLength(3);
      expect(result.pagination).toEqual({
        count: 3,
        totalCount: 3,
        totalPages: 1,
        page: 1,
        limit: 10,
      });
    });


    it("should calculate totalPages correctly when applying limit and offset pagination", async () => {
      // Arrange
      const dto = {
        budgetId: testBudget.id,
        userId: user.id,
        page: 1,
        limit: 2,
        offset: 0,
        sortBy: "id",
        order: "ASC",
      };

      // Act
      const result = await expenseRepository.getAllExpenses(dto as any);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.pagination.count).toBe(2);
      expect(result.pagination.totalCount).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
    });
  });
  //
  describe("getExpenseById", () => {
  it("should return an expense with its associated Budget when it exists", async () => {
    // Arrange
    const createdExpense = await Expense.create({
      name: "Supermarket",
      amount: 150,
      budgetId: testBudget.id,
    });

    // Act
    const result = await expenseRepository.getExpenseById(createdExpense.id);

    // Assert
    expect(result).not.toBeNull();
    expect(result.id).toBe(createdExpense.id);
    expect(result.name).toBe("Supermarket");
    expect(result.amount).toBe(150);
    // check budget model
    expect(result.budget).toBeDefined();
    expect(result.budget.id).toBe(testBudget.id);
    expect(result.budget.name).toBe(testBudget.name);
  });

  it("should return null if the expense does not exist", async () => {
    // Act
    const result = await expenseRepository.getExpenseById(9999);
    // Assert
    expect(result).toBeNull();
  });
});

describe("updateExpenseById", () => {
  it("should update and return the updated expense instance", async () => {
    // Arrange
    const createdExpense = await Expense.create({
      name: "Old Expense Name",
      amount: 50,
      budgetId: testBudget.id,
    });

    const updateDto: UpdateExpenseDto = {
      expenseId: createdExpense.id,
      userId: user.id,
      values: {
        name: "New Expense Name",
        amount: 80,
      },
    };

    // Act
    const result = await expenseRepository.updateExpenseById(updateDto);

    // Assert
    expect(result).not.toBeNull();
    expect(result?.id).toBe(createdExpense.id);
    expect(result?.name).toBe("New Expense Name");
    expect(result?.amount).toBe(80);

    // check if update persisted in db
    const updatedInDb = await Expense.findByPk(createdExpense.id);
    expect(updatedInDb?.name).toBe("New Expense Name");
    expect(updatedInDb?.amount).toBe(80);
  });
});

describe("deleteExpenseById", () => {
  it("should delete the expense and return true when it exists", async () => {
    // Arrange
    const createdExpense = await Expense.create({
      name: "Gym Fee",
      amount: 40,
      budgetId: testBudget.id,
    });

    const deleteDto: GetExpenseByIdDto = {
      expenseId: createdExpense.id,
      userId: user.id,
    };

    // Act
    const result = await expenseRepository.deleteExpenseById(deleteDto);

    // Assert
    expect(result).toBe(true);

    // check if no longer exists in db
    const foundInDb = await Expense.findByPk(createdExpense.id);
    expect(foundInDb).toBeNull();
  });

  it("should return false when trying to delete a non-existent expense", async () => {
    // Arrange
    const deleteDto: GetExpenseByIdDto = {
      expenseId: 9999,
      userId: user.id,
    };
    // Act
    const result = await expenseRepository.deleteExpenseById(deleteDto);
    // Assert
    expect(result).toBe(false);
  });
});
});
