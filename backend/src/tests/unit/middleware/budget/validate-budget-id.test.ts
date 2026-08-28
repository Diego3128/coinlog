import { createRequest, createResponse } from "node-mocks-http";
import { validateBudgetId } from "../../../../middleware/budget/validate-budget-id";
import { AuthenticatedRequest } from "../../../../types/auth/AuthenticatedRequest";
import { BudgetIdRequest } from "../../../../types/BudgetIdRequest";

describe("validateBudgetId", () => {
  it("should responde with a 400 status code if budgetId is missing", () => {
    const req = createRequest({
      userId: 10,
    }) as AuthenticatedRequest;
    const res = createResponse();
    const next = jest.fn();
    const budgetIdValue = undefined;

    validateBudgetId(req, res, next, budgetIdValue as unknown as string);

    expect(next).not.toHaveBeenCalled();
    const response = res._getJSONData();
    expect(response).toEqual({
      error: "Missing budget ID",
      ok: false,
      code: 400,
    });
    expect(res.statusCode).toBe(400);
  });

  it("should responde with a 400 status code if budgetId is not a number", () => {
    const req = createRequest({
      userId: 10,
    }) as AuthenticatedRequest;
    const res = createResponse();
    const next = jest.fn();
    const budgetIdValue = "ten";

    validateBudgetId(req, res, next, budgetIdValue);

    expect(next).not.toHaveBeenCalled();
    const response = res._getJSONData();
    expect(response).toEqual({
      error: "The Budget ID must be a valid positive integer",
      ok: false,
      code: 400,
    });
  });
  //
  it("should responde with a 401 status code if userId is missing", () => {
    const req = createRequest({
    //   userId: 10,
    }) as AuthenticatedRequest;
    const res = createResponse();
    const next = jest.fn();
    const budgetIdValue = "10";

    validateBudgetId(req, res, next, budgetIdValue);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });
  //
  it("should call the next function and attach the budgetId to the request", () => {
    const req = createRequest({
      userId: 10,
    }) as AuthenticatedRequest;
    const res = createResponse();
    const next = jest.fn();
    const budgetIdValue = "1";

    validateBudgetId(req, res, next, budgetIdValue);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req as BudgetIdRequest).budgetId).toBe(1);
    expect((req as BudgetIdRequest).userId).toBe(10);
  });
});
