export class UserResponseDto {
  constructor(
    public readonly id: number,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly username: string,
    public readonly email: string,
    public readonly confirmed: boolean,
    public readonly profilePictureUrl?: string | null,
    public readonly createdAt?: Date,
  ) {}
}