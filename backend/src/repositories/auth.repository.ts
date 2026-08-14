import User from "../models/User";
import {
  CreateUserDtoWithToken,
  IAuthRepository,
} from "./interfaces/auth.repository.interface";
import { Op } from "sequelize";

export class AuthRepository implements IAuthRepository {
  findByEmailOrUsername = async ({
    email,
    username,
  }: {
    email: string;
    username: string;
  }): Promise<User | null> => {
    return await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });
  };

  createNewAccount = async (data: CreateUserDtoWithToken): Promise<User> => {
    return await User.create({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password, //hash
      username: data.username,
      validationToken: data.token,
    });
  };
}
