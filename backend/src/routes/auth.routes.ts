import { Router } from "express";
import { AuthController } from '../controllers/auth.controller';
import { AuthRepository } from '../repositories/auth.repository';
import { IAuthRepository } from "../repositories/interfaces/auth.repository.interface";
import { IAuthService } from '../services/interfaces/auth.service.interface';
import { AuthService } from "../services/auth.service";

export class AuthRoutes{
    public static get routes(): Router{

        const router = Router();

        const authRepository: IAuthRepository = new AuthRepository();
        const authService: IAuthService = new AuthService(authRepository);

        const authController: AuthController = new AuthController(authService);

        //routes under: /api/v1/auth/

        router.post("/create-account" , authController.createAccount);

        return router;

    }
}