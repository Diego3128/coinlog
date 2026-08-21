export class BudgetResponseDto {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly amount: number,
    public readonly userId: number,
    public readonly createdAt: Date,
  ) {}
}