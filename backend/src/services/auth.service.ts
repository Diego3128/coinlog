import { CreateUserDto } from "../dtos/auth/create-user.dto";
import { IAuthService } from "./interfaces/auth.service.interface";
import { IAuthRepository } from "../repositories/interfaces/auth.repository.interface";
import { CustomError } from "../errors/CustomError";
import { HashAdapter } from "../config/adapters/hash.adapter";
import { UserMapper } from "../mappers/user/user.mapper";
import { CreatedAccountResponseDto } from "../dtos/auth/created-account-response.dto";
import { AuthMapper } from "../mappers/auth/auth.mapper";
import { TokenGenerator } from "../config/adapters/token-generator.adapter";

export class AuthService implements IAuthService {
  constructor(private readonly authRepository: IAuthRepository) {}

  createNewAccount = async (
    data: CreateUserDto,
  ): Promise<CreatedAccountResponseDto> => {
    try {
      //check if username  or email is taken
      const existingUser = await this.authRepository.findByEmailOrUsername({
        email: data.email,
        username: data.username,
      });

      if (existingUser) {
        if (existingUser.email === data.email) {
          throw CustomError.badRequest("Email is already registered");
        }
        if (existingUser.username === data.username) {
          throw CustomError.badRequest("Username is already taken");
        }
      }
      const hashedPassword: string = await HashAdapter.hashPassword(data.password);
      const verificationToken = TokenGenerator.generateNumericToken();

      const user = await this.authRepository.createNewAccount({
        ...data,
        token: verificationToken,
        password: hashedPassword,
      });
      if (!user) {
        throw CustomError.internalServer("Error creating account. Try again later");
      } 
      
      return AuthMapper.userToCreatedAccountDto(user);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(
        "Error creating account. Try again later",
      );
    }
  };
}
