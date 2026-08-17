import {type Response } from "express";
export interface ApiResponse<T> {
  ok: boolean;
  message?: string;
  data?: T;
  error?: string;
  code: number;
}

export type TypedResponse<T> = Response<ApiResponse<T>>;

// Response<ResBody, Locals, StatusCode, ReqBody>.  ResBody is the object allowed to be passed to res.json().
// ResBody is overwritten to TypedResponse<T>. all handlers must return a TypedResponse<T>