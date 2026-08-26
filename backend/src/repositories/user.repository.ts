import { GetUserByIdDto } from "../dtos/user/request/get-user-by-id.dto";
import User from "../models/User";
import { IUserRepository } from "./interfaces/user.repository.interface";

export class UserRepository implements IUserRepository {
  getUserById = async (dto: GetUserByIdDto): Promise<User> => {
    return await User.findOne({ where: { id: dto.userId } });
  };

  updateUserPassword = async (
    dto: GetUserByIdDto & { newPassword: string },
  ): Promise<boolean> => {
    const [count] = await User.update(
      { password: dto.newPassword },
      { where: { id: dto.userId } },
    );
    return count > 0;
  };
}
