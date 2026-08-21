import { BudgetResponseDto } from "../../dtos/budget/response/budget-response.dto";
import Budget from "../../models/Budget";

export class BudgetMapper {
  static budgetEntityToBudgetResponseDto(budget: Budget): BudgetResponseDto {
    return new BudgetResponseDto(budget.id, budget.name, budget.amount, budget.userId, budget.createdAt);
  }
}
