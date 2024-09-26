import { Router } from "express";
import {
  loginController,
  registerController,
} from "../controllers/usersController";

const userRoutes = Router();

// Credentials authentication routes
userRoutes.post("/register", registerController);
userRoutes.post("/login", loginController);

export default userRoutes;
