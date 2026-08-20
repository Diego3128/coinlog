export class CreatedAccountResponseDto {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly username: string,
    public readonly confirmed: boolean,
  ) {}
}