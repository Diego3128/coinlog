import { UserResponseDto } from "../../dtos/user/user-response.dto";

export interface IUserService {
    getUserInfo: (userId: number) => Promise<UserResponseDto>
}