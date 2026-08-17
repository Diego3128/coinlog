import { type Request } from "express";

export interface LoginRequest extends Request {
  email: string;
  password: string;
}
