import {type Request, type Response, type NextFunction} from "express";
import { CheckRecoveryTokenRequest } from "../../types/auth/CheckRecoveryTokenRequest";

export const checkRecoveryToken = (req: Request, res: Response, next: NextFunction)=> {
    const code = req.body.recoveryToken ?? '';
    const codeNum = Number(code);

    if(!code || typeof code !== "string" || code.length !== 6 || isNaN(codeNum) ){
        return res.status(400).json({message: "Invalid recovery token"});
    }
    (req as CheckRecoveryTokenRequest).recoveryToken = code;
    next();
};