import { CreatedAccountResponseDto } from "../../dtos/auth/created-account-response.dto";
import { UserResponseDto } from "../../dtos/user/user-response.dto";
import User from "../../models/User";

export class UserMapper {
  static userEntityToResponseDto(user: User): UserResponseDto {
    return new UserResponseDto(
      user.id,
      user.firstName,
      user.lastName,
      user.username,
      user.email,
      user.confirmed,
      user.profilePictureUrl,
      user.createdAt,
    );
  }

  static toCreatedAccountDto(user: User): CreatedAccountResponseDto {
    return new CreatedAccountResponseDto(
      user.id,
      user.email,
      user.username,
      user.confirmed,
    );
  }
}
