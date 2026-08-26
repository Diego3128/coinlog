import { HashAdapter } from "../config/adapters/hash.adapter";
import { CheckPasswordDto } from "../dtos/user/request/check-password.dto";
import { GetUserByIdDto } from "../dtos/user/request/get-user-by-id.dto";
import { UpdatePasswordDto } from "../dtos/user/request/update-password";
import { UserResponseDto } from "../dtos/user/response/user-response.dto";
import { CustomError } from "../errors/CustomError";
import { UserMapper } from "../mappers/user/user.mapper";
import { IUserRepository } from "../repositories/interfaces/user.repository.interface";
import { IUserService } from "./interfaces/user.service.interface";

export class UserService implements IUserService {

    constructor(
        private readonly userRepository: IUserRepository,
    ){}

    getUserInfo = async (dto: GetUserByIdDto): Promise<UserResponseDto> => {
        try {
            const user = await this.userRepository.getUserById(dto);
            if(!user) throw CustomError.notFound("User not found");
            return UserMapper.userEntityToResponseDto(user);
        } catch (error) {
            if(error instanceof CustomError) throw error;
            throw CustomError.internalServer("Error fetching the user");
        }
    };

    updateUserPassword = async(dto: UpdatePasswordDto) : Promise<{ success: boolean; }> => {
        try {
        //check if raw prevPassword matches with hash in db
        const user = await this.userRepository.getUserById({userId: dto.userId}); 

        const isMatch = await HashAdapter.compare({password: dto.prevPassword, hash: user.password});
        if(!isMatch){
            throw CustomError.badRequest("Previous password is incorrect")
        }

        const newPasswordHash = await HashAdapter.hashPassword(dto.newPassword);
        const result = await this.userRepository.updateUserPassword({...dto, newPassword: newPasswordHash});
        if(!result) throw CustomError.internalServer("Password could not be updated");
        return {success: result}
        } catch (error) {
            if(error instanceof CustomError) throw error;
            throw CustomError.internalServer("Error updating user password");
        }
    }

    checkUserPassword = async(dto: CheckPasswordDto) : Promise<{ success: boolean; }> => {
        try {
        //check if raw prevPassword matches with hash in db
        const user = await this.userRepository.getUserById({userId: dto.userId}); 
        if(!user) throw CustomError.notFound("User not found");
        const isMatch = await HashAdapter.compare({password: dto.rawPassword, hash: user.password});
        return {success: isMatch}
        } catch (error) {
            if(error instanceof CustomError) throw error;
            throw CustomError.internalServer("Error updating user password");
        }
    }
}