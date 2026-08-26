import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { IUserService } from "../services/interfaces/user.service.interface";
import { UserService } from "../services/user.service";
import { IUserRepository } from "../repositories/interfaces/user.repository.interface";
import { UserRepository } from "../repositories/user.repository";


export class UserRoutes{
    public static get routes(): Router{

        const router = Router();

        const userRepository: IUserRepository = new UserRepository();
        const userService: IUserService = new UserService(userRepository);
        const userController = new UserController(userService);

        router.get("", userController.getUser ); // get the currently authenticated user

        router.post("/update-password", userController.updateUserPassword ); // update password of currently authenticated user

        router.post("/check-password", userController.checkUserPassword ); // checks if the a raw password matches with the password hash of the authenticated user

        return router;
    }
}