import { CheckPasswordDto } from "../../dtos/user/request/check-password.dto";
import { GetUserByIdDto } from "../../dtos/user/request/get-user-by-id.dto";
import { UpdatePasswordDto } from "../../dtos/user/request/update-password";
import { UserResponseDto } from "../../dtos/user/response/user-response.dto";

export interface IUserService {
    getUserInfo: (dto: GetUserByIdDto) => Promise<UserResponseDto>

    updateUserPassword: (dto: UpdatePasswordDto) => Promise<{success: boolean}>

    checkUserPassword: (dto: CheckPasswordDto) => Promise<{success: boolean}>
}