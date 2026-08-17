import { CreateUserDto } from "../../dtos/auth/create-user.dto";
import { CreatedAccountResponseDto } from '../../dtos/auth/created-account-response.dto';

export interface IAuthService {
    createNewAccount: (data: CreateUserDto) => Promise<CreatedAccountResponseDto>;

    validateUser :(code: string)=> Promise<boolean>;
}