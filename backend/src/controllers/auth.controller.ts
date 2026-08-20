import { type Request, Response } from "express";
import { CreateUserDto } from "../dtos/auth/create-user.dto";
import { CustomError } from "../errors/CustomError";
import { IAuthService } from "../services/interfaces/auth.service.interface";
import { CreatedAccountResponseDto } from "../dtos/auth/created-account-response.dto";
import { ApiResponse, TypedResponse } from "../types/ApiResponse";
import { VerifyCodeRequest } from "../types/auth/VerifyCodeRequest";
import { LoginRequest } from "../types/auth/LoginRequest";
import { LoginUserDto } from "../dtos/auth/login-user.dto";
import { LoginResponseDto } from "../dtos/auth/login-response.dto";
import { ForgotPasswordDto } from "../dtos/auth/forgot-password.dto";
import { ForgotPasswordResponse } from "../dtos/auth/forgot-password-response.dto";
import { CheckRecoveryTokenRequest } from "../types/auth/CheckRecoveryTokenRequest";
import { CheckRecoveryTokenResponse } from "../dtos/auth/check-recovery-token-response.dto";
import { ResetPasswordDto } from "../dtos/auth/reset-password.dto";

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  createAccount = async (
    req: Request,
    res: TypedResponse<CreatedAccountResponseDto>,
  ) => {
    try {
      const [error, createUserDto] = CreateUserDto.create(req.body);
      if (error) this.handleError(error, res);
      const result = await this.authService.createNewAccount(createUserDto);
      const response = {
        ok: true,
        code: 201,
        data: result,
        message: "Account created successfully",
      };
      return res.status(response.code).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  loginAccount = async (
    req: LoginRequest,
    res: TypedResponse<LoginResponseDto>,
  ) => {
    try {
      const [error, loginUserDto] = LoginUserDto.create(req.body);
      if (error) throw error;

      const result: LoginResponseDto =
        await this.authService.loginUser(loginUserDto); //throws if unsuccessful
      const response: ApiResponse<LoginResponseDto> = {
        ok: true,
        code: 200,
        data: result,
      };
      return res.status(response.code).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  renewAccessToken = async (
    req: Request,
    res: TypedResponse<LoginResponseDto>,
  ) => {
    try {
      const jwt = (req.headers.authorization ?? "").split(" ")?.at(1) ?? "";
      if (!jwt) throw CustomError.unAuthorized("jwt not included");
      const result = await this.authService.renewAccessToken(jwt);
      // console.log({result});
      return res.json({ code: 200, ok: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  confirmAccount = async (
    req: VerifyCodeRequest,
    res: TypedResponse<CreatedAccountResponseDto>,
  ) => {
    try {
      const code = req.code;
      await this.authService.validateUser(code);
      const response = {
        ok: true,
        code: 200,
        message: "Account verified",
      };
      return res.status(response.code).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  forgotPassword = async (
    req: Request,
    res: TypedResponse<ForgotPasswordResponse>,
  ) => {
    try {
      const [error, forgotPasswordDto] = ForgotPasswordDto.create(req.body);
      if (error) throw error;
      const response = await this.authService.forgotPassword(
        forgotPasswordDto.email,
      );

      return res.json({ ok: true, code: 200, data: response });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  checkRecoveryToken = async (
    req: CheckRecoveryTokenRequest,
    res: TypedResponse<CheckRecoveryTokenResponse>,
  ) => {
    const recoveryToken = req.recoveryToken;
    try {
      const response: CheckRecoveryTokenResponse = await this.authService.checkRecoveryToken(recoveryToken);
      return res.json({ code: 200, ok: true, data: response });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  resetPassword = async (req: Request, res: TypedResponse<CheckRecoveryTokenResponse>) => {
    try {
      const [error, resetPasswordDto] = ResetPasswordDto.create(req.body);
      if(error) throw error;
      const result: CheckRecoveryTokenResponse =  await this.authService.updateUserPassword(resetPasswordDto);
      res.json({code: 200, ok: true, data: result});
    } catch (error) {
      this.handleError(error, res)      ;
    }
  };

  private handleError = (error: any, res: TypedResponse<null>) => {
    // console.log(error);
    if (error instanceof CustomError) {
      return res
        .status(error.statusCode)
        .json({ error: error.message, ok: false, code: error.statusCode });
    }
    return res
      .status(500)
      .json({ error: "Internal Server Error", ok: false, code: 500 });
  };
}
