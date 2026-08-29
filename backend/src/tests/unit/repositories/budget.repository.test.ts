import { Sequelize } from "sequelize-typescript";
import Budget from "../../../models/Budget";
import { BudgetRepository } from "../../../repositories/budget.repository";
import {
  CreateBudgetDto,
  FilterBudgetDto,
  GetBudgetByIdDto,
  UpdateBudgetDto,
} from "../../../dtos";
import Expense from "../../../models/Expense";
import User from "../../../models/User";
import RefreshToken from "../../../models/RefreshToken";

describe("BudgetRepository (Integration)", () => {
  let testSequelize: Sequelize;
  let budgetRepository: BudgetRepository;
  let user: User;

  // Connect to in memory database before all tests & create all tables (required for relationships)
  beforeAll(async () => {
    testSequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      models: [Budget, Expense, User, RefreshToken],
    });

    await testSequelize.sync({ force: true });
    budgetRepository = new BudgetRepository();
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
  });

  // clean  all used tables after each test
  afterEach(async () => {
    await Budget.destroy({ truncate: true });
    await User.destroy({ truncate: true });
  });

  // close connection when all tests have finished
  afterAll(async () => {
    await testSequelize.close();
  });

  describe("createBudget", () => {
    it("should insert and return a new budget record in the database", async () => {
      //arrange
      const dto: CreateBudgetDto = {
        name: "public services",
        amount: 350,
        userId: user.id,
      };

      // Act
      const createdBudget = await budgetRepository.createBudget(dto);
      // Assert
      expect(createdBudget).toBeDefined();
      expect(createdBudget.id).toBeDefined();
      expect(createdBudget.name).toBe("public services");
      expect(createdBudget.amount).toBe(350);
      expect(createdBudget.userId).toBe(user.id);

      // Doble  check againsts table
      const dbRecord = await Budget.findByPk(createdBudget.id);
      expect(dbRecord).not.toBeNull();
      expect(dbRecord?.name).toBe("public services");
    });
  });

  describe("getBudgetById", () => {
    it("should return null if the budget does not exist", async () => {
      const result = await budgetRepository.getBudgetById({
        id: 999,
        userId: 1,
      });
      expect(result).toBeNull();
    });

    it("should fetch the correct budget by id and userId", async () => {
      // manual seed
      const existing = await Budget.create({
        name: "Groceries",
        amount: 500,
        userId: user.id,
      });
      // act
      const result = await budgetRepository.getBudgetById({
        id: existing.id,
        userId: user.id,
      });
      // assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe(existing.id);
      expect(result?.name).toBe("Groceries");
    });
  });
  //
  describe("getAllBudgets", () => {
    let fakeBudgets: string[] = [];
    //insert some budgets
    beforeEach(async () => {
      fakeBudgets = ["groceries", "gas", "food"];
      for (const element of fakeBudgets) {
        await Budget.create({
          name: element,
          amount: 500,
          userId: user.id,
        });
      }
    });

    it("should return all budgets and correct pagination metadata", async () => {
      const dto: FilterBudgetDto = {
        userId: user.id,
        page: 1,
        limit: 10,
        sortBy: "name",
        order: "ASC",
        offset: 0,
      };

      const result = await budgetRepository.getAllBudgets(dto);

      expect(result.data).toHaveLength(fakeBudgets.length);
      expect(result.pagination).toEqual({
        count: 3,
        limit: 10,
        page: 1,
        totalPages: 1,
        totalCount: 3,
      });
    });

    it("should handle pagination limit correctly", async () => {
      const dto: FilterBudgetDto = {
        userId: user.id,
        page: 1,
        limit: 2,
        sortBy: "name",
        order: "ASC",
        offset: 0,
      };

      const result = await budgetRepository.getAllBudgets(dto);

      expect(result.data).toHaveLength(2);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.totalCount).toBe(3);
    });
  });
  //
  describe("updateBudgetById", () => {
    let budgetItem: Budget;
    beforeEach(async () => {
      budgetItem = await Budget.create({
        name: "test-name",
        amount: 500,
        userId: user.id,
      });
    });

    it("should return the updated budget", async () => {
      const dto: UpdateBudgetDto = {
        id: budgetItem.id,
        userId: budgetItem.userId,
        amount: budgetItem.amount,
        name: "new-name",
        values: { name: "new-name" }, //value is the getter used for the repo to get the defined values for the update
      };
      const budget = await budgetRepository.updateBudgetById(dto);
      expect(budget.name).toEqual("new-name");
    });
    //
    it("should return null if the budget is not found", async () => {
      const dto: UpdateBudgetDto = {
        id: 1000,
        userId: budgetItem.userId,
        values: {},
      };
      const budget = await budgetRepository.updateBudgetById(dto);
      expect(budget).toEqual(null);
    });
  });
  //
  describe("deleteBudgetById", () => {
    let budgetItem: Budget;
    beforeEach(async () => {
      budgetItem = await Budget.create({
        name: "test-name",
        amount: 500,
        userId: user.id,
      });
    });

    it("should return the deleted budget", async () => {
      const dto: GetBudgetByIdDto = {
        id: budgetItem.id,
        userId: budgetItem.userId,
      };
      const budget = await budgetRepository.deleteBudgetById(dto);
      expect(budget.id).toEqual(budgetItem.id)
    });
    //
    it("should return null if the budget is not found", async () => {
      const dto: GetBudgetByIdDto = {
        id: 1000,
        userId: budgetItem.userId,
      };
      const budget = await budgetRepository.deleteBudgetById(dto);
      expect(budget).toEqual(null);
    });
  });
});
