import { Router } from "express";
import { AuthController } from '../controllers/auth.controller';
import { AuthRepository } from '../repositories/auth.repository';
import { IAuthRepository } from "../repositories/interfaces/auth.repository.interface";
import { IAuthService } from '../services/interfaces/auth.service.interface';
import { AuthService } from "../services/auth.service";
import { IEmailService } from "../services/interfaces/email.service.interface";
import { MailtrapService } from "../services/mailtrap-email.service";
import { environments } from "../config/envs/envs";
import { checkVerifyCode } from "../middleware/auth/check-verify-code.middleware";
import { authLimiter, codeVerificationLimiter } from "../middleware/rate-limiter.middleware";


const {MAILTRAP_API_TOKEN, PROD, TEST_INBOX_ID, EMAIL_DOMAIN} =  environments;

export class AuthRoutes{
    public static get routes(): Router{

        const router = Router();

        //especific rate limiting for auth routes
        router.use(authLimiter);

        const emailService: IEmailService = new MailtrapService({EMAIL_DOMAIN, MAILTRAP_API_TOKEN, PROD, TEST_INBOX_ID})

        const authRepository: IAuthRepository = new AuthRepository();
        const authService: IAuthService = new AuthService(authRepository, emailService);

        const authController: AuthController = new AuthController(authService);

        //routes under: /api/v1/auth/

        router.post("/create-account" , authController.createAccount);

        router.post("/confirm-account", codeVerificationLimiter , checkVerifyCode , authController.confirmAccount);

        return router;

    }
}