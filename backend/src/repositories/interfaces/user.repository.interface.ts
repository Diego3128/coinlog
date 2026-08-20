import User from "../../models/User";

export interface IUserRepository {
    getUserById: (userId: number)=> Promise<User>;
}