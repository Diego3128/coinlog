import { type Request } from "express";

export interface CheckRecoveryTokenRequest extends Request {
  recoveryToken: string;
}
