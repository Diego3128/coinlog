import RefreshToken from "../models/RefreshToken";
import User from "../models/User";
import {
  CreateUserDtoWithToken,
  IAuthRepository,
} from "./interfaces/auth.repository.interface";
import { Op } from "sequelize";

export class AuthRepository implements IAuthRepository {
  saveRefreshToken = async (data: {
    userId: number;
    tokenHash: string;
    device?: string | null;
    ipAddress?: string | null;
    expiresAt: Date;
  }): Promise<RefreshToken> => {
    const refreshToken = await RefreshToken.create({
      userId: data.userId,
      device: data.device ?? null,
      ipAddress: data.ipAddress ?? null,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
    });

    return refreshToken;
  };

  findRefreshTokensByUserId = async (
    userId: number,
  ): Promise<RefreshToken[]> => {
    const tokens = await RefreshToken.findAll({ where: { userId } });
    return tokens;
  };

  deleteRefreshToken = async (tokenId: number): Promise<boolean> => {
    const count = await RefreshToken.destroy({ where: { id: tokenId } });
    return !!count;
  };

  deleteAllRefreshTokensByUserId = async (userId: number): Promise<boolean> => {
    const count = await RefreshToken.destroy({ where: { userId: userId } });
    return !!count;
  };

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

  findByEmail = async ({ email }: { email: string }): Promise<User | null> => {
    return await User.findOne({ where: { email: email } });
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

  validateUserAccount = async (code: string): Promise<boolean | null> => {
    const user = await User.findOne({ where: { validationToken: code } });
    if (!user) return null;
    user.confirmed = true;
    user.validationToken = null;
    user.save();
    return true;
  };
}
