import { Router } from "express";
import {
  getUserInfo,
  registerController,
} from "../controllers/usersController";
import authMiddleware from "../middleware/authMiddleware";

const userRoutes = Router();

// Credentials authentication routes
userRoutes.get("/user", authMiddleware, getUserInfo);
userRoutes.post("/register", registerController);

export default userRoutes;
