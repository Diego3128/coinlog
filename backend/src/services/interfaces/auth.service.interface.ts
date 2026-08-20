import { CheckRecoveryTokenResponse } from "../../dtos/auth/check-recovery-token-response.dto";
import { CreateUserDto } from "../../dtos/auth/create-user.dto";
import { CreatedAccountResponseDto } from '../../dtos/auth/created-account-response.dto';
import { ForgotPasswordResponse } from "../../dtos/auth/forgot-password-response.dto";
import { LoginResponseDto } from "../../dtos/auth/login-response.dto";
import { ResetPasswordDto } from "../../dtos/auth/reset-password.dto";

export interface IAuthService {
    createNewAccount: (data: CreateUserDto) => Promise<CreatedAccountResponseDto>;
    
    loginUser :({email, password}: {email: string, password: string})=> Promise<LoginResponseDto>;

    renewAccessToken :(rawRefreshToken: string)=> Promise<LoginResponseDto>;

    validateUser :(code: string)=> Promise<boolean>;

    forgotPassword :(email: string)=> Promise<ForgotPasswordResponse>;

    checkRecoveryToken :(token: string)=> Promise<CheckRecoveryTokenResponse>;

    updateUserPassword: (resetPasswordDto: ResetPasswordDto) => Promise<CheckRecoveryTokenResponse>;
}