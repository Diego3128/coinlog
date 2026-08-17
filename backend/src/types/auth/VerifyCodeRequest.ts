import { type Request } from "express";

export interface VerifyCodeRequest extends Request {
  code: string;
}
