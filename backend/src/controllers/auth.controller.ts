import { type Request, Response } from "express";
import { CreateUserDto } from "../dtos/auth/create-user.dto";
import { CustomError } from "../errors/CustomError";
import { IAuthService } from "../services/interfaces/auth.service.interface";
import { CreatedAccountResponseDto } from "../dtos/auth/created-account-response.dto";
import { ApiResponse } from "../types/ApiResponse";
import { VerifyCodeRequest } from "../types/VerifyCodeRequest";

// Response<ResBody, Locals, StatusCode, ReqBody>.  ResBody is the object allowed to be passed to res.json().
// ResBody is overwritten to TypedResponse<T>. all handlers must return a TypedResponse<T>
type TypedResponse<T> = Response<ApiResponse<T>>;

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
