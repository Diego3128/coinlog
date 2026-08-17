import {type Request, type Response, type NextFunction} from "express";
import { VerifyCodeRequest } from "../../types/auth/VerifyCodeRequest";

export const checkVerifyCode = (req: Request, res: Response, next: NextFunction)=> {
    const code = req.body.code ?? '';
    const codeNum = Number(code);

    if(!code || typeof code !== "string" || code.length !== 6 || isNaN(codeNum) ){
        return res.status(400).json({message: "Invalid verification code"});
    }
    (req as VerifyCodeRequest).code = code;
    next();
};