import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../errors/CustomError";
import { JwtAdapter } from "../../config/adapters/jwt.adapter";
import { UserJwtPayload } from "../../types/auth/UserJwtPayload";
import { TypedResponse } from "../../types/ApiResponse";
import { AuthenticatedRequest } from "../../types/auth/AuthenticatedRequest";

export class ValidateJWT {
  static validateAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authorization = req.header("Authorization");

      if (!authorization) {
        throw CustomError.unAuthorized("No token provided");
      }

      if (!authorization.startsWith("Bearer ")) {
        throw CustomError.unAuthorized("Invalid Bearer token format");
      }

      const token = authorization.split(" ")[1];

      const payload = await JwtAdapter.validateAccessToken<UserJwtPayload>(token);

      if (!payload) {
        throw CustomError.unAuthorized("Invalid or expired access token");
      }
      (req as AuthenticatedRequest).userId =  payload.id ;
      next();
    } catch (error) {
      ValidateJWT.handleError(error, res);
    }
  };

   private static handleError = (error: any, res: TypedResponse<null>) => {
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