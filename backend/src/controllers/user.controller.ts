import { type Response } from "express";
import { AuthenticatedRequest } from "../types/auth/AuthenticatedRequest";
import { IUserService } from "../services/interfaces/user.service.interface";
import { TypedResponse } from "../types/ApiResponse";
import { UserResponseDto } from "../dtos/user/user-response.dto";
import { CustomError } from "../errors/CustomError";

export class UserController {
  constructor(private readonly userService: IUserService) {}

  getUser = async (
    req: AuthenticatedRequest,
    res: TypedResponse<UserResponseDto>,
  ) => {
    try {
      const { userId } = req;
      const user: UserResponseDto = await this.userService.getUserInfo(userId);
      return res.json({ code: 200, ok: true, data: user });
    } catch (error) {
      this.handleError(error, res);
    }
  };

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
