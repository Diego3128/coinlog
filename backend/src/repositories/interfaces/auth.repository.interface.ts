import { CreateUserDto } from "../../dtos/auth/create-user.dto";
import User from "../../models/User";

export interface CreateUserDtoWithToken extends CreateUserDto {
  token: string;
}

export interface IAuthRepository {
 
  createNewAccount: (data: CreateUserDtoWithToken) => Promise<User>;

  findByEmailOrUsername({email,username}: {email: string; username: string}): Promise<User | null>;
}
