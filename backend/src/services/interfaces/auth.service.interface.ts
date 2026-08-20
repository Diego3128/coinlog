import { CreateUserDto } from "../../dtos/auth/create-user.dto";
import { CreatedAccountResponseDto } from '../../dtos/auth/created-account-response.dto';
import { LoginResponseDto } from "../../dtos/auth/login-response.dto";

export interface IAuthService {
    createNewAccount: (data: CreateUserDto) => Promise<CreatedAccountResponseDto>;
    
    loginUser :({email, password}: {email: string, password: string})=> Promise<LoginResponseDto>;

    renewAccessToken :(rawRefreshToken: string)=> Promise<LoginResponseDto>;

    validateUser :(code: string)=> Promise<boolean>;

}