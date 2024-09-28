import { Router } from "express";
import { registerController } from "../controllers/usersController";

const userRoutes = Router();

// Credentials authentication routes
userRoutes.post("/register", registerController);

export default userRoutes;
