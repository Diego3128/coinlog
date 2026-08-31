import { createRequest, createResponse } from "node-mocks-http";
import { ExpenseController } from "../../../controllers/expense.controller";
import { IExpenseService } from "../../../services/interfaces/expense.service.interface";
import { ExpenseResponseDto } from "../../../dtos/expense/response/expense-response.dto";
import { BudgetIdRequest } from "../../../types/BudgetIdRequest";
import { Pagination } from "../../../types/Pagination";
import { ExpenseIdRequest } from "../../../types/ExpenseIdRequest";
import { CustomError } from "../../../errors/CustomError";

describe("ExpenseController", () => {
  let expenseController: ExpenseController;
  let mockExpenseService: jest.Mocked<IExpenseService>;

  const validBody = { name: "eggs", amount: 100 };
  const budgetId = 10;
  const userId = 1;

  beforeEach(() => {
    mockExpenseService = {
      createExpense: jest.fn(),
      deleteById: jest.fn(),
      getAll: jest.fn(),
      getById: jest.fn(),
      updateById: jest.fn(),
    };
    expenseController = new ExpenseController(mockExpenseService);
  });

  describe("createExpense", () => {
    it("should answer with a 201 status and ExpenseResponseDto on success", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/budget/${budgetId}`,
        body: validBody,
        budgetId,
        userId,
      }) as BudgetIdRequest;
      const res = createResponse();

      const dto: ExpenseResponseDto = {
        id: 10,
        name: "eggs",
        amount: 100,
        budgetId,
        createdAt: new Date(),
      };
      mockExpenseService.createExpense.mockResolvedValueOnce(dto);

      // Act
      await expenseController.createExpense(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(201);
      expect(result).toEqual({
        ok: true,
        code: 201,
        data: {
          ...dto,
          createdAt: dto.createdAt.toISOString(),
        },
      });
      expect(mockExpenseService.createExpense).toHaveBeenCalledTimes(1);
    });

    it("should respond with 400 if body is missing required fields", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/budget/${budgetId}`,
        body: { name: "eggs" }, // no amount
        budgetId,
        userId,
      }) as BudgetIdRequest;
      const res = createResponse();

      // Act
      await expenseController.createExpense(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(400);
      expect(result.ok).toBe(false);
      expect(mockExpenseService.createExpense).not.toHaveBeenCalled();
    });

    it("should respond with 400 if budgetId is missing", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/budget/${budgetId}`,
        body: validBody,
        userId,
      }) as BudgetIdRequest;
      const res = createResponse();

      // Act
      await expenseController.createExpense(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(mockExpenseService.createExpense).not.toHaveBeenCalled();
    });

    it("should respond with 401 if userId is missing", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/budget/${budgetId}`,
        body: validBody,
        budgetId,
      }) as BudgetIdRequest;
      const res = createResponse();

      // Act
      await expenseController.createExpense(req, res);

      // Assert
      expect(res.statusCode).toBe(401);
      expect(mockExpenseService.createExpense).not.toHaveBeenCalled();
    });

    it("should respond with 500 when ExpenseService throws an unexpected error", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/budget/${budgetId}`,
        body: validBody,
        budgetId,
        userId,
      }) as BudgetIdRequest;
      const res = createResponse();

      mockExpenseService.createExpense.mockRejectedValueOnce(
        new Error("Service error"),
      );

      // Act
      await expenseController.createExpense(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(500);
      expect(result.ok).toBe(false);
      expect(mockExpenseService.createExpense).toHaveBeenCalledTimes(1);
    });
  });
  //
  describe("getAll", () => {
    const budgetId = 10;
    const userId = 1;

    it("should answer with a 200 status and paginated expenses list on success", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/budget/${budgetId}`,
        method: "GET",
        query: { page: "1", limit: "10" },
        budgetId,
        userId,
      }) as BudgetIdRequest;
      const res = createResponse();

      const mockServiceResult: {
        data: ExpenseResponseDto[];
        pagination: Pagination;
      } = {
        data: [
          {
            id: 1,
            name: "Groceries",
            amount: 150,
            budgetId,
            createdAt: new Date("2026-08-01T10:00:00.000Z"),
          },
          {
            id: 2,
            name: "Internet",
            amount: 50,
            budgetId,
            createdAt: new Date("2026-08-02T10:00:00.000Z"),
          },
        ],
        pagination: {
          count: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
          totalCount: 2,
        },
      };

      mockExpenseService.getAll.mockResolvedValueOnce(mockServiceResult);

      // Act
      await expenseController.getAll(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(result.ok).toBe(true);
      expect(result.code).toBe(200);
      expect(result.data).toEqual({
        data: [
          {
            ...mockServiceResult.data[0],
            createdAt: mockServiceResult.data[0].createdAt.toISOString(),
          },
          {
            ...mockServiceResult.data[1],
            createdAt: mockServiceResult.data[1].createdAt.toISOString(),
          },
        ],
        pagination: mockServiceResult.pagination,
      });
      expect(mockExpenseService.getAll).toHaveBeenCalledTimes(1);
    });

    it("should respond with a 400 error if budgetId is missing", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/budget/${budgetId}`,
        method: "GET",
        query: { page: "1", limit: "10" },
        // budgetId skipped
        userId,
      }) as BudgetIdRequest;
      const res = createResponse();

      // Act
      await expenseController.getAll(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(400);
      expect(result.ok).toBe(false);
      expect(mockExpenseService.getAll).not.toHaveBeenCalled();
    });

    it("should respond with a 401 error if userId is missing", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/budget/${budgetId}`,
        method: "GET",
        query: { page: "1", limit: "10" },
        budgetId,
        // userId skipped
      }) as BudgetIdRequest;
      const res = createResponse();

      // Act
      await expenseController.getAll(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(401);
      expect(result.ok).toBe(false);
      expect(mockExpenseService.getAll).not.toHaveBeenCalled();
    });

    it("should handle service errors with status 500 when ExpenseService fails", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/budget/${budgetId}`,
        method: "GET",
        query: { page: "1", limit: "10" },
        budgetId,
        userId,
      }) as BudgetIdRequest;
      const res = createResponse();

      mockExpenseService.getAll.mockRejectedValueOnce(
        new Error("Unexpected service failure"),
      );

      // Act
      await expenseController.getAll(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(500);
      expect(result.ok).toBe(false);
      expect(result.error).toBe("Internal Server Error");
      expect(mockExpenseService.getAll).toHaveBeenCalledTimes(1);
    });
  });
  //
  describe("getById", () => {
    const expenseId = 5;
    const userId = 1;

    it("should answer with a 200 status and the ExpenseResponseDto on success", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/${expenseId}`,
        method: "GET",
        expenseId,
        userId,
      }) as ExpenseIdRequest;
      const res = createResponse();

      const mockExpense: ExpenseResponseDto = {
        id: expenseId,
        name: "Dinner",
        amount: 45,
        budgetId: 10,
        createdAt: new Date("2026-08-31T10:00:00.000Z"),
      };

      mockExpenseService.getById.mockResolvedValueOnce(mockExpense);

      // Act
      await expenseController.getById(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(result.ok).toBe(true);
      expect(result.code).toBe(200);
      expect(result.data).toEqual({
        ...mockExpense,
        createdAt: mockExpense.createdAt.toISOString(),
      });
      expect(mockExpenseService.getById).toHaveBeenCalledWith({
        expenseId,
        userId,
      });
      expect(mockExpenseService.getById).toHaveBeenCalledTimes(1);
    });

    it("should respond with a 400 error if expenseId is missing or invalid", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/${expenseId}`,
        method: "GET",
        // expenseId skipped
        userId,
      }) as ExpenseIdRequest;
      const res = createResponse();

      // Act
      await expenseController.getById(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(400);
      expect(result.ok).toBe(false);
      expect(mockExpenseService.getById).not.toHaveBeenCalled();
    });

    it("should respond with a 401 error if userId is missing", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/${expenseId}`,
        method: "GET",
        expenseId,
        // userId skipped
      }) as ExpenseIdRequest;
      const res = createResponse();

      // Act
      await expenseController.getById(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(401);
      expect(result.ok).toBe(false);
      expect(mockExpenseService.getById).not.toHaveBeenCalled();
    });

    it("should respond with 404 when ExpenseService throws CustomError.notFound", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/${expenseId}`,
        method: "GET",
        expenseId,
        userId,
      }) as ExpenseIdRequest;
      const res = createResponse();

      mockExpenseService.getById.mockRejectedValueOnce(
        CustomError.notFound(`Expense with id '${expenseId}' not found`),
      );

      // Act
      await expenseController.getById(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(404);
      expect(result.ok).toBe(false);
      expect(result.code).toBe(404);
      expect(result.error).toBe(`Expense with id '${expenseId}' not found`);
      expect(mockExpenseService.getById).toHaveBeenCalledTimes(1);
    });

    it("should handle service errors with status 500 on unexpected failure", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/${expenseId}`,
        method: "GET",
        expenseId,
        userId,
      }) as ExpenseIdRequest;
      const res = createResponse();

      mockExpenseService.getById.mockRejectedValueOnce(
        new Error("Database connection error"),
      );

      // Act
      await expenseController.getById(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(500);
      expect(result.ok).toBe(false);
      expect(result.error).toBe("Internal Server Error");
      expect(mockExpenseService.getById).toHaveBeenCalledTimes(1);
    });
  });
  //
  describe("updateById", () => {
    const expenseId = 5;
    const userId = 1;
    const updateBody = { name: "Updated eggs", amount: 120 };

    it("should update and return ExpenseResponseDto with 200 status on success", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/${expenseId}`,
        method: "PUT",
        body: updateBody,
        expenseId,
        userId,
      }) as ExpenseIdRequest;
      const res = createResponse();

      const mockUpdatedExpense: ExpenseResponseDto = {
        id: expenseId,
        name: "Updated eggs",
        amount: 120,
        budgetId: 10,
        createdAt: new Date("2026-08-31T10:00:00.000Z"),
      };

      mockExpenseService.updateById.mockResolvedValueOnce(mockUpdatedExpense);

      // Act
      await expenseController.updateById(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(result.ok).toBe(true);
      expect(result.code).toBe(200);
      expect(result.data).toEqual({
        ...mockUpdatedExpense,
        createdAt: mockUpdatedExpense.createdAt.toISOString(),
      });
      expect(mockExpenseService.updateById).toHaveBeenCalledWith(
        expect.objectContaining({
          expenseId,
          userId,
          name: "Updated eggs",
          amount: 120,
        }),
      );
      expect(mockExpenseService.updateById).toHaveBeenCalledTimes(1);
    });

    it("should respond with 400 status if expenseId is missing", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/${expenseId}`,
        method: "PUT",
        body: updateBody,
        // expenseId skipped
        userId,
      }) as ExpenseIdRequest;
      const res = createResponse();

      // Act
      await expenseController.updateById(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(400);
      expect(result.ok).toBe(false);
      expect(mockExpenseService.updateById).not.toHaveBeenCalled();
    });

    it("should respond with 401 status if userId is missing", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/${expenseId}`,
        method: "PUT",
        body: updateBody,
        expenseId,
        // userId skipped
      }) as ExpenseIdRequest;
      const res = createResponse();

      // Act
      await expenseController.updateById(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(401);
      expect(result.ok).toBe(false);
      expect(mockExpenseService.updateById).not.toHaveBeenCalled();
    });

    it("should respond with 404 status when ExpenseService throws CustomError.notFound", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/${expenseId}`,
        method: "PUT",
        body: updateBody,
        expenseId,
        userId,
      }) as ExpenseIdRequest;
      const res = createResponse();

      mockExpenseService.updateById.mockRejectedValueOnce(
        CustomError.notFound(`Expense with id '${expenseId}' not found`),
      );

      // Act
      await expenseController.updateById(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(404);
      expect(result.ok).toBe(false);
      expect(result.code).toBe(404);
      expect(result.error).toBe(`Expense with id '${expenseId}' not found`);
      expect(mockExpenseService.updateById).toHaveBeenCalledTimes(1);
    });

    it("should handle service errors with 500 status on unexpected failure", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/${expenseId}`,
        method: "PUT",
        body: updateBody,
        expenseId,
        userId,
      }) as ExpenseIdRequest;
      const res = createResponse();

      mockExpenseService.updateById.mockRejectedValueOnce(
        new Error("Database write error"),
      );

      // Act
      await expenseController.updateById(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(500);
      expect(result.ok).toBe(false);
      expect(result.error).toBe("Internal Server Error");
      expect(mockExpenseService.updateById).toHaveBeenCalledTimes(1);
    });
  });
  //
  describe("deleteById", () => {
    const expenseId = 5;
    const userId = 1;

    it("should return status 200 and success response when deletion succeeds", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/${expenseId}`,
        method: "DELETE",
        expenseId,
        userId,
      }) as ExpenseIdRequest;
      const res = createResponse();

      const mockServiceResult = { success: true };
      mockExpenseService.deleteById.mockResolvedValueOnce(mockServiceResult);

      // Act
      await expenseController.deleteById(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(result.ok).toBe(true);
      expect(result.code).toBe(200);
      expect(result.data).toEqual({ success: true });
      expect(mockExpenseService.deleteById).toHaveBeenCalledWith({
        expenseId,
        userId,
      });
      expect(mockExpenseService.deleteById).toHaveBeenCalledTimes(1);
    });

    it("should respond with status 400 if expenseId is missing", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/${expenseId}`,
        method: "DELETE",
        // expenseId skipped
        userId,
      }) as ExpenseIdRequest;
      const res = createResponse();

      // Act
      await expenseController.deleteById(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(400);
      expect(result.ok).toBe(false);
      expect(mockExpenseService.deleteById).not.toHaveBeenCalled();
    });

    it("should respond with status 401 if userId is missing", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/${expenseId}`,
        method: "DELETE",
        expenseId,
        // userId skipped
      }) as ExpenseIdRequest;
      const res = createResponse();

      // Act
      await expenseController.deleteById(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(401);
      expect(result.ok).toBe(false);
      expect(mockExpenseService.deleteById).not.toHaveBeenCalled();
    });

    it("should respond with status 404 when ExpenseService throws CustomError.notFound", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/${expenseId}`,
        method: "DELETE",
        expenseId,
        userId,
      }) as ExpenseIdRequest;
      const res = createResponse();

      mockExpenseService.deleteById.mockRejectedValueOnce(
        CustomError.notFound(`Expense with id '${expenseId}' not found`),
      );

      // Act
      await expenseController.deleteById(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(404);
      expect(result.ok).toBe(false);
      expect(result.code).toBe(404);
      expect(result.error).toBe(`Expense with id '${expenseId}' not found`);
      expect(mockExpenseService.deleteById).toHaveBeenCalledTimes(1);
    });

    it("should respond with status 500 on unexpected service errors", async () => {
      // Arrange
      const req = createRequest({
        url: `/api/v1/expenses/${expenseId}`,
        method: "DELETE",
        expenseId,
        userId,
      }) as ExpenseIdRequest;
      const res = createResponse();

      mockExpenseService.deleteById.mockRejectedValueOnce(
        new Error("Service error"),
      );

      // Act
      await expenseController.deleteById(req, res);

      // Assert
      const result = res._getJSONData();
      expect(res.statusCode).toBe(500);
      expect(result.ok).toBe(false);
      expect(result.error).toBe("Internal Server Error");
      expect(mockExpenseService.deleteById).toHaveBeenCalledTimes(1);
    });
  });
});
