import { UserResponseDto } from "../dtos/user/user-response.dto";
import { CustomError } from "../errors/CustomError";
import { UserMapper } from "../mappers/user/user.mapper";
import { IUserRepository } from "../repositories/interfaces/user.repository.interface";
import { IUserService } from "./interfaces/user.service.interface";

export class UserService implements IUserService {

    constructor(
        private readonly userRepository: IUserRepository,
    ){}

    getUserInfo = async (userId: number): Promise<UserResponseDto> => {
        try {
            const user = await this.userRepository.getUserById(userId);
            if(!user) throw CustomError.notFound("User not found");
            return UserMapper.userEntityToResponseDto(user);
        } catch (error) {
            if(error instanceof CustomError) throw error;
            console.log(error);
            throw CustomError.internalServer("Error fetching the user");
        }
    };
}