import { createRequest, createResponse } from "node-mocks-http";
import { NextFunction } from "express";
import { AuthenticatedRequest } from "../../../../types/auth/AuthenticatedRequest";
import { validateExpenseId } from "../../../../middleware/expense/validate-expense-id.middleware";
import { ExpenseIdRequest } from "../../../../types/ExpenseIdRequest";
import { GetExpenseByIdDto } from "../../../../dtos";

describe("validateExpenseId Middleware", () => {
  let mockNext: NextFunction;

  beforeEach(() => {
    mockNext = jest.fn();
  });

  it("should attach expenseId to req and call next() when parameters are valid", () => {
    // Arrange
    const expenseIdValue = "15";
    const req = createRequest({
      userId: 1,
    }) as AuthenticatedRequest;
    const res = createResponse();

    // Act
    validateExpenseId(req, res, mockNext, expenseIdValue);

    // Assert
    expect((req as ExpenseIdRequest).expenseId).toBe(15);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
  });

  it("should respond with 400 error when expenseIdValue is invalid", () => {
    // Arrange
    const invalidExpenseId = "abc";
    const req = createRequest({
      userId: 1,
    }) as AuthenticatedRequest;
    const res = createResponse();

    // Act
    validateExpenseId(req, res, mockNext, invalidExpenseId);

    // Assert
    const result = res._getJSONData();
    expect(res.statusCode).toBe(400);
    expect(result.ok).toBe(false);
    expect(result.code).toBe(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should respond with 401 error when userId is missing from request", () => {
    // Arrange
    const expenseIdValue = "15";
    const req = createRequest({
      // userId skipped
    }) as AuthenticatedRequest;
    const res = createResponse();
    // Act
    validateExpenseId(req, res, mockNext, expenseIdValue);
    // Assert
    const result = res._getJSONData();
    expect(res.statusCode).toBe(401);
    expect(result.ok).toBe(false);
    expect(result.code).toBe(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should respond with 500 error when unexpected error is thrown", () => {
    // Arrange
    const expenseIdValue = "15";
    const req = createRequest({
      // userId skipped
    }) as AuthenticatedRequest;
    const res = createResponse();

    const spy = jest.spyOn(GetExpenseByIdDto, "create")
    .mockImplementationOnce(()=> {throw new Error("Unexpected error")})

    // Act
    validateExpenseId(req, res, mockNext, expenseIdValue);
    // Assert
    const result = res._getJSONData();
    expect(res.statusCode).toBe(500);
    expect(result.ok).toBe(false);
    expect(result.code).toBe(500);
    expect(mockNext).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});
