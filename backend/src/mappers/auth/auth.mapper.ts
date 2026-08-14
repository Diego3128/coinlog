import { CreatedAccountResponseDto } from "../../dtos/auth/created-account-response.dto";
import User from "../../models/User";

export class AuthMapper {
  static userToCreatedAccountDto(user: User): CreatedAccountResponseDto {
    return new CreatedAccountResponseDto(
      user.id,
      user.email,
      user.username,
      user.confirmed,
    );
  }
}
