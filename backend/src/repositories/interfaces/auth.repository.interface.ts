import { CreateUserDto } from "../../dtos/auth/create-user.dto";
import RefreshToken from "../../models/RefreshToken";
import User from "../../models/User";

export interface CreateUserDtoWithToken extends CreateUserDto {
  token: string;
}

export interface IAuthRepository {
 
  createNewAccount: (data: CreateUserDtoWithToken) => Promise<User>;

  findByEmailOrUsername({email,username}: {email: string; username: string}): Promise<User | null>;

  findByEmail({email}: {email: string;}): Promise<User | null>;

  validateUserAccount: (code: string) => Promise<boolean | null>

  /**
   * Saves a new hashed refresh token
   */
  saveRefreshToken: (data: {
    userId: number;
    tokenHash: string;
    device?: string | null;
    ipAddress?: string | null;
    expiresAt: Date;
  }) => Promise<RefreshToken>;

  /**
   * Finds all active user sessions
   */
  findRefreshTokensByUserId: (userId: number) => Promise<RefreshToken[]>;

  /**
   * Drops a especific token
   */
  deleteRefreshToken: (tokenId: number) => Promise<boolean>;

  /**
   * Deletes all user tokens
   */
  deleteAllRefreshTokensByUserId: (userId: number) => Promise<boolean>;
}
