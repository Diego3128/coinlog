import { type Response } from "express";
import { AuthenticatedRequest } from "../types/auth/AuthenticatedRequest";
import { IUserService } from "../services/interfaces/user.service.interface";
import { ApiResponse, TypedResponse } from "../types/ApiResponse";
import { UserResponseDto } from "../dtos/user/response/user-response.dto";
import { CustomError } from "../errors/CustomError";
import { GetUserByIdDto } from '../dtos/user/request/get-user-by-id.dto';
import { UpdatePasswordDto } from '../dtos/user/request/update-password';
import { CheckPasswordDto } from "../dtos/user/request/check-password.dto";

export class UserController {
  constructor(private readonly userService: IUserService) {}

  getUser = async (
    req: AuthenticatedRequest,
    res: TypedResponse<UserResponseDto>,
  ) => {
    try {
      const [error, getUserByIdDto] = GetUserByIdDto.create(req.userId);
      if(error) throw error;
      const user: UserResponseDto = await this.userService.getUserInfo(getUserByIdDto);
      return res.json({ code: 200, ok: true, data: user });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  updateUserPassword = async (req: AuthenticatedRequest, res: TypedResponse<{success: boolean}>)=> {
    try {
      const {newPassword = "", prevPassword = "", } = req.body;
      const [error, updatePasswordDto] = UpdatePasswordDto.create({userId: req.userId, newPassword, prevPassword});
      if(error) throw error;
      const result = await this.userService.updateUserPassword(updatePasswordDto); //throws if not successful
      const response: ApiResponse<{success: boolean}> = {code: 200, ok: true, data: result};
      return res.json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  checkUserPassword = async (req: AuthenticatedRequest, res: TypedResponse<{success: boolean}>)=> {
    try {
      const {rawPassword = "" } = req.body;
      const [error, checkPasswordDto] = CheckPasswordDto.create({userId: req.userId, rawPassword});
      if(error) throw error;
      const result = await this.userService.checkUserPassword(checkPasswordDto);
      const response: ApiResponse<{success: boolean}> = {code: 200, ok: true, data: result};
      return res.json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError = (error: any, res: TypedResponse<null>) => {
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
