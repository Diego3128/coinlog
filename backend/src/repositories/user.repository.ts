import User from '../models/User';
import { IUserRepository } from "./interfaces/user.repository.interface";

export class UserRepository  implements IUserRepository{

    getUserById = async (userId: number): Promise<User> => {
        return await User.findOne({where: {id: userId}})
    };
}