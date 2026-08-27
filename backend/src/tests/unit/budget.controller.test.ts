import { createRequest, createResponse } from "node-mocks-http";
import { budgets } from "../mocks/budgets";
import { BudgetController } from "../../controllers/budget.controller";
import { IBudgetService } from "../../services/interfaces/budget.service.interface";
import { AuthenticatedRequest } from "../../types/auth/AuthenticatedRequest";
import { BudgetResponseDto } from "../../dtos";
import { BudgetIdRequest } from "../../types/BudgetIdRequest";

describe("BudgetController", () => {
  let mockedBudgetService: jest.Mocked<IBudgetService>;
  let budgetController: BudgetController;

  beforeEach(() => {
    //define mock methods for the service interface
    mockedBudgetService = {
      createBudget: jest.fn(),
      getAllBudgets: jest.fn(),
      getBudgetById: jest.fn(),
      updateBudgetById: jest.fn(),
      deleteBudgetById: jest.fn(),
    };
    //create a new instance of the controller
    budgetController = new BudgetController(mockedBudgetService);
  });

  describe("getAll", () => {
    it("should return 2 budgets for user with id 2", async () => {
      //define response by the service
      const mockedResult = {
        data: budgets,
        pagination: {
          count: 3,
          totalCount: 3,
          page: 1,
          totalPages: 1,
          limit: 10,
        },
      };

      //crete mocked req & res
      const req = createRequest({
        url: "/api/v1/budgets",
        method: "GET",
        userId: "2",
        query: {
          page: 1,
          limit: 10,
          sortBy: "createdAt",
          order: "ASC",
        },
      }) as AuthenticatedRequest;
      const res = createResponse();

      //set a mock value to be returned when calling the mocked service
      mockedBudgetService.getAllBudgets.mockResolvedValue({
        data: mockedResult.data.filter((b) => b.userId === 2),
        pagination: mockedResult.pagination,
      });

      //execute controller
      await budgetController.getAll(req, res);

      //expects
      expect(mockedBudgetService.getAllBudgets).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(200);
      const response = res._getJSONData();
      expect(response.ok).toEqual(true);
      expect(response.data.data).toHaveLength(2);
    });
    //
    it("should responde with a 401 status  if userId is missing or invalid", async () => {
      //crete mocked req & res
      const req = createRequest({
        url: "/api/v1/budgets",
        method: "GET",
        // userId: "-2",
      }) as AuthenticatedRequest;
      const res = createResponse();
      //execute controller
      await budgetController.getAll(req, res);
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData().ok).toBe(false);
    });
    //
    it("should responde with a 400 status code if query is invalid", async () => {
      //crete mocked req & res
      const req = createRequest({
        url: "/api/v1/budgets",
        method: "GET",
        userId: "10",
        query: {
          page: -1, // negative page
          limit: 10,
          sortBy: "createdAt",
          order: "ASC",
        },
      }) as AuthenticatedRequest;
      const res = createResponse();

      //execute controller
      await budgetController.getAll(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "Page must be a positive integer",
        ok: false,
        code: 400,
      });
    });
    //
  });
  //
  describe("createBudget", () => {
    it("should responde with a new budget and 201 status code", async () => {
      //create req & res
      const req = createRequest({
        url: "/api/v1/budgets",
        body: {
          name: "Test budget",
          amount: 1000,
        },
        userId: "2",
      }) as AuthenticatedRequest;

      const res = createResponse();

      //define response by the service
      const budget: BudgetResponseDto = {
        id: 10,
        name: "Test budget",
        amount: 1000,
        userId: 2,
        createdAt: new Date(),
      };
      // mock service returned value
      mockedBudgetService.createBudget.mockResolvedValue(budget);
      await budgetController.createBudget(req, res);

      const response = res._getJSONData();
      expect(res.statusCode).toBe(201);
      expect(response.code).toBe(201);
      expect(response.ok).toBe(true);
      expect(response.data).toEqual({
        ...budget,
        createdAt: budget.createdAt.toISOString(),
      });
    });
    //
    it("should responde with a 400 status code if body is invalid", async () => {
      //create req & res
      const req = createRequest({
        url: "/api/v1/budgets",
        body: {
          //anme & amount are mandatory fields
          name: "Test budget",
          //   amount: 1000,
        },
        userId: "2",
      }) as AuthenticatedRequest;

      const res = createResponse();
      await budgetController.createBudget(req, res);

      const response = res._getJSONData();
      expect(res.statusCode).toBe(400);
      expect(response.code).toBe(400);
      expect(response.ok).toBe(false);
      expect(mockedBudgetService.createBudget).not.toHaveBeenCalled();
    });
    //
    it("should responde with a 401 status  if userId is missing or invalid", async () => {
      //create req & res
      const req = createRequest({
        url: "/api/v1/budgets",
        body: {
          name: "Test budget",
          amount: 1000,
        },
        userId: "-2",
      }) as AuthenticatedRequest;

      const res = createResponse();
      await budgetController.createBudget(req, res);
      const response = res._getJSONData();
      expect(res.statusCode).toBe(401);
      expect(response.code).toBe(401);
      expect(response.ok).toBe(false);
      expect(mockedBudgetService.createBudget).not.toHaveBeenCalled();
    });
  });
  //
  describe("getBudgetById", () => {
    it("should responde with a budget and a 200 status code", async () => {
      //create req & res
      const req = createRequest({
        url: "/api/v1/budgets/1",
        userId: "2",
        budgetId: "1",
      }) as BudgetIdRequest;

      const res = createResponse();
      //define response by the service
      const budget: BudgetResponseDto = {
        id: 1,
        name: "Test budget",
        amount: 1000,
        userId: 2,
        createdAt: new Date(),
      };
      // mock service returned value
      mockedBudgetService.getBudgetById.mockResolvedValue(budget);
      await budgetController.getBudgetById(req, res);
      const response = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(response.code).toBe(200);
      expect(response.ok).toBe(true);
      expect(response.data).toEqual({
        ...budget,
        createdAt: budget.createdAt.toISOString(),
      });
    });
    //
    it("should responde with a 400 status code if budgetId is missing or invalid", async () => {
      //create req & res
      const req = createRequest({
        url: "/api/v1/budgets/1",
        userId: "2",
        // budgetId: "1",
      }) as BudgetIdRequest;

      const res = createResponse();
      //define response by the service
      const budget: BudgetResponseDto = {
        id: 1,
        name: "Test budget",
        amount: 1000,
        userId: 2,
        createdAt: new Date(),
      };
      // mock service returned value
      mockedBudgetService.getBudgetById.mockResolvedValue(budget);
      await budgetController.getBudgetById(req, res);
      const response = res._getJSONData();
      expect(res.statusCode).toBe(400);
      expect(response.code).toBe(400);
      expect(response.ok).toBe(false);
    });

    //
    it("should responde with a 401 status code if userId is missing or invalid", async () => {
      //create req & res
      const req = createRequest({
        url: "/api/v1/budgets/1",
        // userId: "2",
        budgetId: "1",
      }) as BudgetIdRequest;

      const res = createResponse();
      //define response by the service
      // mock service returned value
      await budgetController.getBudgetById(req, res);
      const response = res._getJSONData();
      expect(res.statusCode).toBe(401);
      expect(response.code).toBe(401);
      expect(response.ok).toBe(false);
    });
  });
  //
  describe("updateBudgetById", () => {
    it("should responde with the updated budget and a 200 status code", async () => {
      //create req & res
      const req = createRequest({
        method: "PUT",
        url: "/api/v1/budgets/1",
        userId: "2",
        budgetId: "1",
        body: {
          //at least 1 field must be passed
          name: "new name",
          // amount: 10
        },
      }) as BudgetIdRequest;

      const res = createResponse();
      //define response by the service
      const budget: BudgetResponseDto = {
        id: 1,
        name: "new name",
        amount: 1000,
        userId: 2,
        createdAt: new Date(),
      };
      // mock service returned value
      mockedBudgetService.updateBudgetById.mockResolvedValue(budget);
      await budgetController.updateBudgetById(req, res);
      const response = res._getJSONData();
      expect(mockedBudgetService.updateBudgetById).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(200);
      expect(response.code).toBe(200);
      expect(response.ok).toBe(true);
      expect(response.data).toEqual({
        ...budget,
        createdAt: budget.createdAt.toISOString(),
      });
    });
    //
    it("should responde with a 400 status code if body is missing or invalid", async () => {
      //create req & res
      const req = createRequest({
        method: "PUT",
        url: "/api/v1/budgets/1",
        userId: "2",
        budgetId: "1",
        body: {
          //at least 1 field must be passed
          //   name: "new name",
          // amount: 10
        },
      }) as BudgetIdRequest;

      const res = createResponse();
      // mock service returned value
      await budgetController.updateBudgetById(req, res);
      const response = res._getJSONData();
      expect(res.statusCode).toBe(400);
      expect(response.code).toBe(400);
      expect(response.ok).toBe(false);
      expect(mockedBudgetService.updateBudgetById).not.toHaveBeenCalled();
    });
    //
    it("should responde with a 400 status code if budgetId is missing or invalid", async () => {
      //create req & res
      const req = createRequest({
        method: "PUT",
        url: "/api/v1/budgets/1",
        userId: "2",
        budgetId: "-1",
        body: {
          //at least 1 field must be passed
          name: "new name",
          amount: 10,
        },
      }) as BudgetIdRequest;

      const res = createResponse();
      // mock service returned value
      await budgetController.updateBudgetById(req, res);
      const response = res._getJSONData();
      expect(mockedBudgetService.updateBudgetById).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
      expect(response.code).toBe(400);
      expect(response.ok).toBe(false);
    });
    //
    it("should responde with a 401 status code if userId is missing or invalid", async () => {
      //create req & res
      const req = createRequest({
        method: "PUT",
        url: "/api/v1/budgets/1",
        // userId: "2",
        budgetId: "1",
        body: {
          //   at least 1 field must be passed
          name: "new name",
          amount: 10,
        },
      }) as BudgetIdRequest;

      const res = createResponse();
      // mock service returned value
      await budgetController.updateBudgetById(req, res);
      const response = res._getJSONData();
      expect(mockedBudgetService.updateBudgetById).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(401);
      expect(response.code).toBe(401);
      expect(response.ok).toBe(false);
    });
  });
  //
  describe("deleteBudgetById", () => {
    it("should responde with the deleted budget and a 200 status code", async () => {
      //create req & res
      const req = createRequest({
        method: "DELETE",
        url: "/api/v1/budgets/1",
        userId: "2",
        budgetId: "1",
      }) as BudgetIdRequest;

      const res = createResponse();
      //define response by the service
      const budget: BudgetResponseDto = {
        id: 1,
        name: "new name",
        amount: 1000,
        userId: 2,
        createdAt: new Date(),
      };
      // mock service returned value
      mockedBudgetService.deleteBudgetById.mockResolvedValue(budget);
      await budgetController.deleteBudgetById(req, res);

      const response = res._getJSONData();
      expect(mockedBudgetService.deleteBudgetById).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(200);
      expect(response.code).toBe(200);
      expect(response.ok).toBe(true);
      expect(response.data).toEqual({
        ...budget,
        createdAt: budget.createdAt.toISOString(),
      });
    });
    //
    it("should responde with a 400 status code if budgetId is missing or invalid", async () => {
      //create req & res
      const req = createRequest({
        method: "DELETE",
        url: "/api/v1/budgets/1",
        userId: "2",
        budgetId: "-1",
      }) as BudgetIdRequest;

      const res = createResponse();

      await budgetController.deleteBudgetById(req, res);

      const response = res._getJSONData();
      expect(mockedBudgetService.deleteBudgetById).toHaveBeenCalledTimes(0);
      expect(res.statusCode).toBe(400);
      expect(response.code).toBe(400);
      expect(response.ok).toBe(false);
    });
    //
    it("should responde with a 401 status code if userId is missing or invalid", async () => {
      //create req & res
      const req = createRequest({
        method: "DELETE",
        url: "/api/v1/budgets/1",
        // userId: "2",
        budgetId: "1",
      }) as BudgetIdRequest;

      const res = createResponse();

      await budgetController.deleteBudgetById(req, res);
      const response = res._getJSONData();
      expect(mockedBudgetService.deleteBudgetById).toHaveBeenCalledTimes(0);
      expect(res.statusCode).toBe(401);
      expect(response.code).toBe(401);
      expect(response.ok).toBe(false);
    });
  });
});
