import { GetUserByIdDto } from "../../dtos/user/request/get-user-by-id.dto";
import User from "../../models/User";

export interface IUserRepository {
    getUserById: (dto: GetUserByIdDto)=> Promise<User>;

    updateUserPassword: (dto: GetUserByIdDto  & {newPassword: string})=> Promise<boolean>;

}