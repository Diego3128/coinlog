import { ExpenseResponseDto } from '../../dtos/expense/response/expense-response.dto';
import Expense from '../../models/Expense';

export class ExpenseMapper {
    static expenseEntityToExpenseResponseDto = (expense: Expense ) => {
        return new ExpenseResponseDto(expense.id, expense. name, expense.amount, expense.budgetId, expense.createdAt);
    }
}