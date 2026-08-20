export class CheckRecoveryTokenResponse {
  constructor(
    private readonly message: string,
    private readonly valid: boolean,
  ) {}
}
