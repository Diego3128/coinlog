import {
  BudgetResponseDto,
  CreateExpenseDto,
  FilterExpenseDto,
  GetExpenseByIdDto,
  UpdateExpenseDto,
} from "../../../dtos";
import { ExpenseResponseDto } from "../../../dtos/expense/response/expense-response.dto";
import { CustomError } from "../../../errors/CustomError";
import Expense from "../../../models/Expense";
import { IExpenseRepository } from "../../../repositories/interfaces/expense.repository.interface";
import { ExpenseService } from "../../../services/expense.service";
import { IBudgetService } from "../../../services/interfaces/budget.service.interface";
import { IExpenseService } from "../../../services/interfaces/expense.service.interface";
import { Pagination } from "../../../types/Pagination";
import { expenses } from "../../mocks/expenses";

describe("ExpenseService", () => {
  let mockExpenseRepository: jest.Mocked<IExpenseRepository>;

  let mockBudgetService: jest.Mocked<IBudgetService>;

  let expenseService: IExpenseService;

  beforeEach(() => {
    mockExpenseRepository = {
      createExpense: jest.fn(),
      getExpenseById: jest.fn(),
      deleteExpenseById: jest.fn(),
      getAllExpenses: jest.fn(),
      updateExpenseById: jest.fn(),
    };

    mockBudgetService = {
      createBudget: jest.fn(),
      deleteBudgetById: jest.fn(),
      getAllBudgets: jest.fn(),
      getBudgetById: jest.fn(),
      updateBudgetById: jest.fn(),
    };

    expenseService = new ExpenseService(
      mockExpenseRepository,
      mockBudgetService,
    );
  });
  //
  describe("createExpense", () => {
    const createExpenseDto: CreateExpenseDto = {
      name: "eggs",
      amount: 100,
      budgetId: 10,
      userId: 1,
    };

    const mockBudgetEntity: BudgetResponseDto = {
      id: 10,
      name: "Monthly Grocery",
      amount: 500,
      userId: 1,
      createdAt: new Date("2026-08-01T00:00:00.000Z"),
    };

    const mockExpenseEntity = {
      id: 1,
      name: "eggs",
      amount: 100,
      budgetId: 10,
      createdAt: new Date("2026-08-31T10:00:00.000Z"),
    };

    it("should create and return an ExpenseResponseDto when budget exists and repo succeeds", async () => {
      // Arrange
      mockBudgetService.getBudgetById.mockResolvedValueOnce(mockBudgetEntity);
      mockExpenseRepository.createExpense.mockResolvedValueOnce(
        mockExpenseEntity as Expense,
      );

      // Act
      const result = await expenseService.createExpense(createExpenseDto);

      // Assert
      expect(mockBudgetService.getBudgetById).toHaveBeenCalledWith({
        id: createExpenseDto.budgetId,
        userId: createExpenseDto.userId,
      });
      expect(mockExpenseRepository.createExpense).toHaveBeenCalledWith(
        createExpenseDto,
      );
      expect(result).toEqual({
        id: mockExpenseEntity.id,
        name: mockExpenseEntity.name,
        amount: mockExpenseEntity.amount,
        budgetId: mockExpenseEntity.budgetId,
        createdAt: mockExpenseEntity.createdAt,
      });
    });

    it("should throw CustomError if budgetService.getBudgetById fails with CustomError (e.g., 404)", async () => {
      // Arrange
      const notFoundError = CustomError.notFound("Budget not found");
      mockBudgetService.getBudgetById.mockRejectedValueOnce(notFoundError);

      // Act & Assert
      await expect(
        expenseService.createExpense(createExpenseDto),
      ).rejects.toThrow(notFoundError);

      expect(mockBudgetService.getBudgetById).toHaveBeenCalledTimes(1);
      expect(mockExpenseRepository.createExpense).not.toHaveBeenCalled();
    });

    it("should throw CustomError.conflict (409) if budgetService returns null/undefined", async () => {
      // Arrange
      mockBudgetService.getBudgetById.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        expenseService.createExpense(createExpenseDto),
      ).rejects.toEqual(
        CustomError.conflict("Error assigning expense to budget"),
      );

      expect(mockBudgetService.getBudgetById).toHaveBeenCalledTimes(1);
      expect(mockExpenseRepository.createExpense).not.toHaveBeenCalled();
    });

    it("should propagate CustomError if expenseRepository throws a CustomError", async () => {
      // Arrange
      mockBudgetService.getBudgetById.mockResolvedValueOnce(mockBudgetEntity);
      const customRepoError = new CustomError(400, "Invalid expense data");
      mockExpenseRepository.createExpense.mockRejectedValueOnce(
        customRepoError,
      );
      // Act & Assert
      await expect(
        expenseService.createExpense(createExpenseDto as any),
      ).rejects.toThrow(customRepoError);

      expect(mockExpenseRepository.createExpense).toHaveBeenCalledTimes(1);
    });

    it("should wrap unhandled errors into a 500 CustomError", async () => {
      // Arrange
      mockBudgetService.getBudgetById.mockResolvedValueOnce(mockBudgetEntity);
      mockExpenseRepository.createExpense.mockRejectedValueOnce(
        new Error("Database connection lost"),
      );

      // Act & Assert
      await expect(
        expenseService.createExpense(createExpenseDto as any),
      ).rejects.toEqual(
        new CustomError(500, "Error creating a new expense. Try again later"),
      );

      expect(mockExpenseRepository.createExpense).toHaveBeenCalledTimes(1);
    });
  });
  //
  describe("getById", () => {
    const getExpenseByIdDto: GetExpenseByIdDto = {
      expenseId: 5,
      userId: 1,
    };

    const mockExpenseEntity: ExpenseResponseDto = {
      id: 5,
      name: "Dinner",
      amount: 45,
      budgetId: 10,
      createdAt: new Date("2026-08-31T10:00:00.000Z"),
    };

    const mockBudgetEntity: BudgetResponseDto = {
      id: 10,
      name: "Monthly Budget",
      amount: 500,
      userId: 1,
      createdAt: new Date("2026-08-01T00:00:00.000Z"),
    };

    it("should return ExpenseResponseDto when expense exists and budget belongs to user", async () => {
      // Arrange
      mockExpenseRepository.getExpenseById.mockResolvedValueOnce(
        mockExpenseEntity as Expense,
      );
      mockBudgetService.getBudgetById.mockResolvedValueOnce(mockBudgetEntity);

      // Act
      const result = await expenseService.getById(getExpenseByIdDto);

      // Assert
      expect(mockExpenseRepository.getExpenseById).toHaveBeenCalledWith(
        getExpenseByIdDto.expenseId,
      );
      expect(mockBudgetService.getBudgetById).toHaveBeenCalledWith({
        id: mockExpenseEntity.budgetId,
        userId: getExpenseByIdDto.userId,
      });
      expect(result).toEqual(mockExpenseEntity);
    });

    it("should throw CustomError 404 if expense is not found in repository", async () => {
      // Arrange
      mockExpenseRepository.getExpenseById.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(expenseService.getById(getExpenseByIdDto)).rejects.toEqual(
        CustomError.notFound(
          `The expense with id '${getExpenseByIdDto.expenseId}' was not found`,
        ),
      );

      expect(mockExpenseRepository.getExpenseById).toHaveBeenCalledWith(
        getExpenseByIdDto.expenseId,
      );
      expect(mockBudgetService.getBudgetById).not.toHaveBeenCalled();
    });

    it("should rewrite budget 404 error to expense 404 error when budget check fails", async () => {
      // Arrange
      mockExpenseRepository.getExpenseById.mockResolvedValueOnce(
        mockExpenseEntity as Expense,
      );
      mockBudgetService.getBudgetById.mockRejectedValueOnce(
        CustomError.notFound("Budget not found"),
      );

      // Act & Assert
      await expect(expenseService.getById(getExpenseByIdDto)).rejects.toEqual(
        CustomError.notFound(
          `The expense with id '${getExpenseByIdDto.expenseId}' was not found`,
        ),
      );

      expect(mockExpenseRepository.getExpenseById).toHaveBeenCalledTimes(1);
      expect(mockBudgetService.getBudgetById).toHaveBeenCalledWith({
        id: mockExpenseEntity.budgetId,
        userId: getExpenseByIdDto.userId,
      });
    });

    it("should throw CustomError.internalServer (500) on unexpected errors or non-404 errors", async () => {
      // Arrange
      mockExpenseRepository.getExpenseById.mockRejectedValueOnce(
        new Error("Database connection error"),
      );

      // Act & Assert
      await expect(
        expenseService.getById(getExpenseByIdDto as any),
      ).rejects.toEqual(
        CustomError.internalServer(
          `Error fetching the expense with id ${getExpenseByIdDto.expenseId}`,
        ),
      );

      expect(mockExpenseRepository.getExpenseById).toHaveBeenCalledTimes(1);
    });
  });
  //
  describe("getAll", () => {
    const filterDto: FilterExpenseDto = {
      budgetId: 1,
      userId: 1,
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      offset: 0,
      order: "ASC",
    };

    const mockBudgetEntity: BudgetResponseDto = {
      id: 1,
      name: "Transport Budget",
      amount: 1000,
      userId: 1,
      createdAt: new Date("2026-08-01T00:00:00.000Z"),
    };

    // Transform string dates to Date objects
    const mockExpenseEntities = expenses.slice(0, 2).map((exp) => ({
      ...exp,
      createdAt: new Date(exp.createdAt),
      updatedAt: new Date(exp.updatedAt),
    }));

    const mockPagination: Pagination = {
      count: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
      totalCount: 2,
    };

    it("should return mapped expenses and pagination when budget exists and repo succeeds", async () => {
      // Arrange
      mockBudgetService.getBudgetById.mockResolvedValueOnce(mockBudgetEntity);
      mockExpenseRepository.getAllExpenses.mockResolvedValueOnce({
        data: mockExpenseEntities as Expense[],
        pagination: mockPagination,
      });

      // Act
      const result = await expenseService.getAll(filterDto);

      // Assert
      expect(mockBudgetService.getBudgetById).toHaveBeenCalledWith({
        id: filterDto.budgetId,
        userId: filterDto.userId,
      });
      expect(mockExpenseRepository.getAllExpenses).toHaveBeenCalledWith(
        filterDto,
      );
      expect(result.pagination).toEqual(mockPagination);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({
        id: mockExpenseEntities[0].id,
        name: mockExpenseEntities[0].name,
        amount: mockExpenseEntities[0].amount,
        budgetId: mockExpenseEntities[0].budgetId,
        createdAt: mockExpenseEntities[0].createdAt,
      });
    });

    it("should propagate CustomError if budgetService throws CustomError (e.g. 404)", async () => {
      // Arrange
      const notFoundError = CustomError.notFound("Budget not found");
      mockBudgetService.getBudgetById.mockRejectedValueOnce(notFoundError);

      // Act & Assert
      await expect(expenseService.getAll(filterDto)).rejects.toThrow(
        notFoundError,
      );

      expect(mockBudgetService.getBudgetById).toHaveBeenCalledWith({
        id: filterDto.budgetId,
        userId: filterDto.userId,
      });
      expect(mockExpenseRepository.getAllExpenses).not.toHaveBeenCalled();
    });

    it("should throw CustomError.internalServer on unhandled unexpected errors", async () => {
      // Arrange
      mockBudgetService.getBudgetById.mockResolvedValueOnce(mockBudgetEntity);
      mockExpenseRepository.getAllExpenses.mockRejectedValueOnce(
        new Error("Database connection lost"),
      );

      // Act & Assert
      await expect(expenseService.getAll(filterDto)).rejects.toEqual(
        CustomError.internalServer("Error fetching expenses"),
      );

      expect(mockExpenseRepository.getAllExpenses).toHaveBeenCalledWith(
        filterDto,
      );
    });
  });
  //
  describe("updateById", () => {
    const updateExpenseDto: UpdateExpenseDto = {
      expenseId: 5,
      userId: 1,
      name: "Updated Groceries",
      amount: 150,
      values: {}
    };

    const mockUpdatedExpenseEntity: ExpenseResponseDto = {
      id: 5,
      name: "Updated Groceries",
      amount: 150,
      budgetId: 10,
      createdAt: new Date("2026-08-31T10:00:00.000Z"),
    };

    it("should update expense and return mapped ExpenseResponseDto on success", async () => {
      // Arrange
      // spy getById to emulate expense exists & belongs to the yser
      jest
        .spyOn(expenseService, "getById")
        .mockResolvedValueOnce(mockUpdatedExpenseEntity);

      mockExpenseRepository.updateExpenseById.mockResolvedValueOnce(mockUpdatedExpenseEntity as Expense); // as Expense because the repos always return the database Entity (Expense) 

      // Act
      const result = await expenseService.updateById(updateExpenseDto);

      // Assert
      expect(expenseService.getById).toHaveBeenCalledWith({
        expenseId: updateExpenseDto.expenseId,
        userId: updateExpenseDto.userId,
      });
      expect(mockExpenseRepository.updateExpenseById).toHaveBeenCalledWith(
        updateExpenseDto,
      );
      expect(result).toEqual(mockUpdatedExpenseEntity);
    });

    it("should propagate CustomError if getById fails (e.g. 404 Not Found)", async () => {
      // Arrange
      const notFoundError = CustomError.notFound("Expense not found");
      jest
        .spyOn(expenseService, "getById")
        .mockRejectedValueOnce(notFoundError);

      // Act & Assert
      await expect(expenseService.updateById(updateExpenseDto),).rejects.toThrow(notFoundError);

      expect(mockExpenseRepository.updateExpenseById).not.toHaveBeenCalled();
    });

    it("should throw CustomError.internalServer on database error during update", async () => {
      // Arrange
      jest.spyOn(expenseService, "getById").mockResolvedValueOnce(mockUpdatedExpenseEntity);

      mockExpenseRepository.updateExpenseById.mockRejectedValueOnce(new Error("Database connection error"),);

      // Act & Assert
      await expect(
        expenseService.updateById(updateExpenseDto),
      ).rejects.toEqual(
        CustomError.internalServer(
          `Error updating the expense with id ${updateExpenseDto.expenseId}`,
        ),
      );

      expect(mockExpenseRepository.updateExpenseById).toHaveBeenCalledWith(updateExpenseDto);
    });
  });
  //
  describe("deleteById", () => {
    const getExpenseByIdDto: GetExpenseByIdDto = {
      expenseId: 5,
      userId: 1,
    };

    const mockExpenseEntity: ExpenseResponseDto = {
      id: 5,
      name: "Dinner",
      amount: 45,
      budgetId: 10,
      createdAt: new Date("2026-08-31T10:00:00.000Z"),
    };

    it("should delete expense and return success true when deletion succeeds", async () => {
      // Arrange
      jest .spyOn(expenseService, "getById").mockResolvedValueOnce(mockExpenseEntity);
      mockExpenseRepository.deleteExpenseById.mockResolvedValueOnce(true);

      // Act
      const result = await expenseService.deleteById(getExpenseByIdDto);

      // Assert
      expect(expenseService.getById).toHaveBeenCalledWith({
        expenseId: getExpenseByIdDto.expenseId,
        userId: getExpenseByIdDto.userId,
      });
      expect(mockExpenseRepository.deleteExpenseById).toHaveBeenCalledWith(
        getExpenseByIdDto,
      );
      expect(result).toEqual({ success: true });
    });

    it("should propagate CustomError if getById fails", async () => {
      // Arrange
      const notFoundError = CustomError.notFound("Expense not found");
      jest
        .spyOn(expenseService, "getById")
        .mockRejectedValueOnce(notFoundError);

      // Act & Assert
      await expect(
        expenseService.deleteById(getExpenseByIdDto ),
      ).rejects.toThrow(notFoundError);

      expect(mockExpenseRepository.deleteExpenseById).not.toHaveBeenCalled();
    });

    it("should throw CustomError.internalServer on database error during deletion", async () => {
      // Arrange
      jest
        .spyOn(expenseService, "getById")
        .mockResolvedValueOnce(mockExpenseEntity);

      mockExpenseRepository.deleteExpenseById.mockRejectedValueOnce(
        new Error("Foreign key constraint or DB failure"),
      );

      // Act & Assert
      await expect(
        expenseService.deleteById(getExpenseByIdDto ),
      ).rejects.toEqual(
        CustomError.internalServer(
          `Error deleting the expense with id ${getExpenseByIdDto.expenseId}`,
        ),
      );

      expect(mockExpenseRepository.deleteExpenseById).toHaveBeenCalledWith(
        getExpenseByIdDto,
      );
    });
  });
});
