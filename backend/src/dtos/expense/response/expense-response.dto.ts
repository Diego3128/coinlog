export class ExpenseResponseDto {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly amount: number,
    public readonly budgetId: number,
    public readonly createdAt: Date,
  ) {}
}