export class LoginResponseDto {
  constructor(
    private readonly accessToken: string,
    private readonly refreshToken: string,
  ) {}
}
