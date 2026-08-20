import { CreateUserDto } from "../dtos/auth/create-user.dto";
import { IAuthService } from "./interfaces/auth.service.interface";
import { IAuthRepository } from "../repositories/interfaces/auth.repository.interface";
import { CustomError } from "../errors/CustomError";
import { HashAdapter } from "../config/adapters/hash.adapter";
import { CreatedAccountResponseDto } from "../dtos/auth/created-account-response.dto";
import { AuthMapper } from "../mappers/auth/auth.mapper";
import { TokenGenerator } from "../config/adapters/token-generator.adapter";
import { IEmailService } from "./interfaces/email.service.interface";
import { ColoredLog } from "../config/adapters/colors.adapter";
import { verificationEmailTemplate } from "../config/templates/email/verification-email.template";
import { loggedInEmailTemplate } from "../config/templates/email/logged-in-email.template";
import { LoginResponseDto } from "../dtos/auth/login-response.dto";
import { JwtAdapter } from "../config/adapters/jwt.adapter";
import { ForgotPasswordResponse } from "../dtos/auth/forgot-password-response.dto";
import { passwordResetEmailTemplate } from "../config/templates/email/password-token-recovery-email.template";
import { CheckRecoveryTokenResponse } from "../dtos/auth/check-recovery-token-response.dto";
import { ResetPasswordDto } from "../dtos/auth/reset-password.dto";

export class AuthService implements IAuthService {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly emailService: IEmailService,
  ) {}

  createNewAccount = async (
    data: CreateUserDto,
  ): Promise<CreatedAccountResponseDto> => {
    try {
      //check if username  or email is taken
      const existingUser = await this.authRepository.findByEmailOrUsername({
        email: data.email,
        username: data.username,
      });

      if (existingUser) {
        if (existingUser.email === data.email) {
          throw CustomError.badRequest("Email is already registered");
        }
        if (existingUser.username === data.username) {
          throw CustomError.badRequest("Username is already taken");
        }
      }
      const hashedPassword: string = await HashAdapter.hashPassword(
        data.password,
      );
      const verificationToken = TokenGenerator.generateNumericToken();

      const user = await this.authRepository.createNewAccount({
        ...data,
        token: verificationToken,
        password: hashedPassword,
      });
      if (!user) {
        throw CustomError.internalServer(
          "Error creating account. Try again later",
        );
      }

      //send email without blocking or canceling if it fails
      this.sendVerificationToken({
        recipient: user.email,
        username: user.username,
        token: user.validationToken,
      }).catch((error) =>
        console.error("Email sending failed asynchronously:", error),
      );

      return AuthMapper.userToCreatedAccountDto(user);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(
        "Error creating account. Try again later",
      );
    }
  };

  loginUser = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<LoginResponseDto> => {
    // check if user exists
    const existingUser = await this.authRepository.findByEmail({ email });
    if (!existingUser)
      throw CustomError.notFound(`User with email '${email}' does not exist`);

    if (!existingUser.confirmed)
      throw CustomError.forbidden(`Account not verified`);

    //check if password and hash match
    const match = await HashAdapter.compare({
      password: password,
      hash: existingUser.password,
    });
    if (!match) throw CustomError.unAuthorized(`Invalid credentials`);

    const id = existingUser.id as number;
    const { accessToken, refreshToken } = await this.generateTokens(id);

    if (!accessToken || !refreshToken)
      throw CustomError.internalServer("Error creating authentication tokens");

    const hashedRefreshToken = await HashAdapter.hashPassword(refreshToken);
    const expirationDate = JwtAdapter.getExpirationDate(refreshToken);

    if (!expirationDate) {
      throw CustomError.internalServer(
        "Error calculating token expiration date",
      );
    }

    await this.authRepository.saveRefreshToken({
      userId: id,
      tokenHash: hashedRefreshToken,
      expiresAt: expirationDate,
    });

    this.sendAccessNotificationEmail({
      recipient: existingUser.email,
      username: existingUser.username,
    });

    return AuthMapper.createLoginResponseDto({ accessToken, refreshToken });
  };

  /**
   * Generates a new access token and refreh token taking a refresh token
   */
  renewAccessToken = async (
    rawRefreshToken: string,
  ): Promise<LoginResponseDto> => {
    // Validate sign and jwt expiration
    const payload = await JwtAdapter.validateRefreshToken<{ id: number }>(
      rawRefreshToken,
    );

    if (!payload) {
      throw CustomError.unAuthorized("Invalid or expired refresh token");
    }

    const userId = payload.id;
    // console.log({userId});

    // user active sessions in 'refresh_tokens'
    const activeSessions =
      await this.authRepository.findRefreshTokensByUserId(userId);
    // console.log({ activeSessions });

    if (!activeSessions || activeSessions.length === 0) {
      throw CustomError.unAuthorized("Session not found or revoked");
    }

    // compare token with stored token hashes
    let matchedSession = null;

    for (const session of activeSessions) {
      const isMatch = await HashAdapter.compare({
        password: rawRefreshToken,
        hash: session.tokenHash,
      });

      if (isMatch) {
        matchedSession = session;
        break;
      }
    }

    // if there is no match, revoke all sessions
    if (!matchedSession) {
      await this.authRepository.deleteAllRefreshTokensByUserId(userId);
      throw CustomError.unAuthorized(
        "Security alert: Invalid or reused refresh token. Please login again.",
      );
    }

    // delete consumed token
    await this.authRepository.deleteRefreshToken(matchedSession.id);

    // generate new pair of tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(userId);

    if (!newAccessToken || !newRefreshToken) {
      throw CustomError.internalServer(
        "Error generating new authentication tokens",
      );
    }

    const expiresAt = JwtAdapter.getExpirationDate(newRefreshToken);
    if (!expiresAt) {
      throw CustomError.internalServer(
        "Error calculating token expiration date",
      );
    }

    const newHashedRefreshToken =
      await HashAdapter.hashPassword(newRefreshToken);

    // save new token
    await this.authRepository.saveRefreshToken({
      userId,
      tokenHash: newHashedRefreshToken,
      expiresAt,
    });

    return AuthMapper.createLoginResponseDto({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  };

  private generateTokens = async (userId: number) => {
    const accessToken = await JwtAdapter.generateAccessToken(
      { id: userId },
      "30m",
    );
    const refreshToken = await JwtAdapter.generateRefreshToken(
      { id: userId },
      "5d",
    );
    return { accessToken, refreshToken };
  };

  validateUser = async (code: string): Promise<boolean> => {
    const result = await this.authRepository.validateUserAccount(code);
    if (!result)
      throw CustomError.badRequest(
        "The account was not confirmed. Make sure the code is valid.",
      );

    return result;
  };

  forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
    try {
      //user exists
      const userExists = await this.authRepository.findByEmail({ email });
      if (!userExists) throw CustomError.forbidden("user does not exist");

      //create token
      const token = TokenGenerator.generateNumericToken();

      userExists.validationToken = token;
      await userExists.save();

      // send code
      const sent = await this.sendRecoveryToken({
        recipient: userExists.email,
        username: userExists.username,
        token: token,
      });
      if (!sent) {
        userExists.validationToken = null;
        userExists.save();
        throw CustomError.internalServer("Error sending recovery token email");
      }
      //create reponse
      return new ForgotPasswordResponse(
        "Recovery token sent to: " + userExists.email,
      );
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer("Error creating recovery token");
    }
  };

  updateUserPassword = async (
    resetPasswordDto: ResetPasswordDto,
  ): Promise<CheckRecoveryTokenResponse> => {
    try {
      const passwordHash = await HashAdapter.hashPassword(
        resetPasswordDto.newPassword,
      );
      const result = await this.authRepository.updateUserPassword({
        email: resetPasswordDto.email,
        passwordHash,
        validationToken: resetPasswordDto.recoveryToken,
      });
      if(!result) throw CustomError.internalServer("Password could not be updated. Make sure the email and recoveryToken are valid");
      return new CheckRecoveryTokenResponse("Password updated", true);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer("Error updating password");
    }
  };

  checkRecoveryToken = async (
    token: string,
  ): Promise<CheckRecoveryTokenResponse> => {
    try {
      //check if token exists
      const tokenExists =
        await this.authRepository.validationTokenExists(token);
      if (tokenExists) {
        return new CheckRecoveryTokenResponse("Token exists", true);
      } else {
        throw CustomError.notFound("Token does not exist");
      }
      // const token = this.authRepository.valid
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer("Error validating token");
    }
  };

  private sendRecoveryToken = async ({
    recipient,
    token,
    username,
  }: {
    recipient: string;
    username: string;
    token: string;
  }): Promise<boolean> => {
    try {
      const { html } = passwordResetEmailTemplate({ token, username });

      return await this.emailService.sendEmail({
        html,
        subject: "Coinlog - Password recovery token",
        recipients: [recipient],
        // senderPrefix: 'support'
      });
    } catch (error) {
      ColoredLog.error("Failed to send  email with recovery token:");
      console.log(error);
      return false;
    }
  };

  private sendVerificationToken = async ({
    recipient,
    token,
    username,
  }: {
    recipient: string;
    username: string;
    token: string;
  }): Promise<boolean> => {
    try {
      const { html } = verificationEmailTemplate({ token, username });

      return await this.emailService.sendEmail({
        html,
        subject: "Coinlog - Verify your account",
        recipients: [recipient],
        // senderPrefix: 'support'
      });
    } catch (error) {
      ColoredLog.error("Failed to send verification email:");
      console.log(error);
      return false;
    }
  };

  private sendAccessNotificationEmail = async ({
    recipient,
    username,
  }: {
    recipient: string;
    username: string;
  }): Promise<boolean> => {
    try {
      const { html, subject } = loggedInEmailTemplate({
        email: recipient,
        username: username,
        subject: "Coinlog — Security Alert: New Login Detected",
      });

      return await this.emailService.sendEmail({
        html,
        subject: subject,
        recipients: [recipient],
        // senderPrefix: 'support'
      });
    } catch (error) {
      ColoredLog.error("Failed to send access notification email:");
      console.log(error);
      return false;
    }
  };
}
