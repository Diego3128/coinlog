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
}
