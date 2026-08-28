import {
  BudgetResponseDto,
  CreateBudgetDto,
  FilterBudgetDto,
  GetBudgetByIdDto,
  UpdateBudgetDto,
} from "../../../dtos";
import { CustomError } from "../../../errors/CustomError";
import Budget from "../../../models/Budget";
import { IBudgetRepository } from "../../../repositories/interfaces/budget.repository.interface";
import { BudgetService } from "../../../services/budget.service";
import { Pagination } from "../../../types/Pagination";
import { budgets } from "../../mocks/budgets";

describe("BudgetService", () => {
  let budgetRespositoryMock: jest.Mocked<IBudgetRepository>;
  let budgetService: BudgetService;

  beforeEach(() => {
    budgetRespositoryMock = {
      createBudget: jest.fn(),
      deleteBudgetById: jest.fn(),
      getAllBudgets: jest.fn(),
      getBudgetById: jest.fn(),
      updateBudgetById: jest.fn(),
    };
    budgetService = new BudgetService(budgetRespositoryMock);
  });

  describe("createBudget", () => {
    it("should return a BudgetResponseDto", async () => {
      const dto: CreateBudgetDto = {
        userId: 10,
        amount: 100,
        name: "home",
      };
      budgetRespositoryMock.createBudget.mockResolvedValueOnce({
        ...dto,
        id: 1,
        createdAt: new Date(),
      } as any);
      const res = await budgetService.createBudget(dto);
      expect(res instanceof BudgetResponseDto).toBe(true);
      expect(budgetRespositoryMock.createBudget).toHaveBeenCalledWith(dto);
    });
    //
    it("should throw a CustomError if there is an error creating the budget", async () => {
      budgetRespositoryMock.createBudget.mockRejectedValueOnce(
        new Error("DB error"),
      );
      await expect(
        async () => await budgetService.createBudget({} as any),
      ).rejects.toThrow(CustomError);
    });
  });
  //
  describe("getAllBudgets", () => {
    it("should throw a CustomError if there is an error fetching the budgets", async () => {
      //arrange
      budgetRespositoryMock.getAllBudgets.mockRejectedValueOnce(
        new Error("DB error"),
      );
      //act & assert
      await expect(budgetService.getAllBudgets({} as any)).rejects.toThrow(
        CustomError,
      );
    });
    //
    it("should return a BudgetResponseDto & Pagination object", async () => {
      //arrange
      const dto: FilterBudgetDto = {
        limit: 10,
        offset: 0,
        order: "ASC",
        page: 1,
        userId: 10,
        sortBy: "amount",
      };
      const returnedValue: {
        data: Budget[];
        pagination: Pagination;
      } = {
        data: budgets as Budget[],
        pagination: {
          count: 10,
          limit: 10,
          page: 1,
          totalCount: 1000,
          totalPages: 100,
        },
      };
      //act
      budgetRespositoryMock.getAllBudgets.mockResolvedValueOnce({
        data: returnedValue.data,
        pagination: returnedValue.pagination,
      });
      const result = await budgetService.getAllBudgets(dto);

      //assert
      expect(budgetRespositoryMock.getAllBudgets).toHaveBeenCalledTimes(1);
      expect(budgetRespositoryMock.getAllBudgets).toHaveBeenCalledWith(dto);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.every((e) => e instanceof BudgetResponseDto)).toBe(
        true,
      );
      expect(result.pagination).toEqual(returnedValue.pagination);
    });
  });
  //
  describe("getBudgetById", () => {
    const dto: GetBudgetByIdDto = {
      id: 10,
      userId: 1,
    };

    it("should throw a Custom error if there is an error fetching the budget", async () => {
      //arrange
      budgetRespositoryMock.getBudgetById.mockRejectedValueOnce(
        new Error("DB error"),
      );
      //act & assert
      await expect(budgetService.getBudgetById(dto)).rejects.toThrow(
        CustomError,
      );
    });
    //
    it("should return a BudgetResponseDto", async () => {
      // assert
      const budget = budgets[0] as Budget;
      budgetRespositoryMock.getBudgetById.mockResolvedValueOnce(budget);
      //act
      const result = await budgetService.getBudgetById(dto);
      //assert
      expect(result instanceof BudgetResponseDto).toBe(true);
      expect(budgetRespositoryMock.getBudgetById).toHaveBeenCalledTimes(1);
      expect(budgetRespositoryMock.getBudgetById).toHaveBeenCalledWith(dto);
    });
    //
    it("should throw a 404 CustomError if the budget is null", async () => {
      //arrange
      budgetRespositoryMock.getBudgetById.mockResolvedValueOnce(null);
      //act & assert
      try {
        await budgetService.getBudgetById(dto);
        expect(budgetRespositoryMock.getBudgetById).toHaveBeenCalledTimes(1);
      } catch (error) {
        if (error instanceof CustomError) {
          expect(error.statusCode).toBe(404);
          expect(error.message).toBe("The budget with id '10' was not found.");
        }
      }
    });
  });
  //
  describe("updateBudgetById", () => {
    const dto: UpdateBudgetDto = {
      id: 10,
      userId: 20,
      amount: 1000,
      name: "new name",
      values: {} as any,
    };
    //
    it("should throw a 500 CustomError if the budget cannot be updated", async () => {
      //arrange
      budgetRespositoryMock.updateBudgetById.mockRejectedValueOnce(
        new Error("DB error"),
      );
      //act & assert
      await expect(budgetService.updateBudgetById(dto)).rejects.toThrow(
        expect.objectContaining({
          statusCode: 500,
        }),
      );
    });

    it("should throw a 404 CustomError if the budget cannot be found", async () => {
      //arrange
      budgetRespositoryMock.updateBudgetById.mockResolvedValueOnce(null);
      //act & assert
      await expect(budgetService.updateBudgetById(dto)).rejects.toThrow(
        expect.objectContaining({
          statusCode: 404,
        }),
      );
    });

    it("should return a BudgetResponseDto on a successful update", async () => {
      //arrange
      budgetRespositoryMock.updateBudgetById.mockResolvedValueOnce(
        budgets[0] as Budget,
      );
      //act & assert
      const response = await budgetService.updateBudgetById(dto);
      expect(response instanceof BudgetResponseDto).toBe(true);
      expect(budgetRespositoryMock.updateBudgetById).toHaveBeenCalledTimes(1);
    });
  });
  //
  describe("deleteBudgetById", () => {
    const dto: GetBudgetByIdDto = {
      id: 11,
      userId: 10,
    };

    it("should throw a CustomError 500 if there is an error deleting the budget", async () => {
      //arrange
      budgetRespositoryMock.deleteBudgetById.mockRejectedValueOnce(
        new Error("DB error"),
      );
      //act & assert
      await expect(budgetService.deleteBudgetById(dto)).rejects.toThrow(
        expect.objectContaining({
          statusCode: 500,
        }),
      );
      expect(budgetRespositoryMock.deleteBudgetById).toHaveBeenCalledTimes(1);
    });

    it("should throw a CustomError 404 if the budget is not found", async () => {
      //arrange
      budgetRespositoryMock.deleteBudgetById.mockResolvedValueOnce(null);
      //act & assert
      await expect(budgetService.deleteBudgetById(dto)).rejects.toThrow(
        expect.objectContaining({
          statusCode: 404,
        }),
      );
      expect(budgetRespositoryMock.deleteBudgetById).toHaveBeenCalledTimes(1);
    });

    it("should return a BudgetResponseDto object if the operation is successful", async () => {
      //arrange
      budgetRespositoryMock.deleteBudgetById.mockResolvedValueOnce(
        budgets[0] as Budget,
      );
      //act & assert
      const result = await budgetService.deleteBudgetById(dto);
      expect(result instanceof BudgetResponseDto).toBe(true);
      expect(budgetRespositoryMock.deleteBudgetById).toHaveBeenCalledTimes(1);
      expect(budgetRespositoryMock.deleteBudgetById).toHaveBeenCalledWith(dto);
    });
  });
});
