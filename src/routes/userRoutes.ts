import { Router } from "express";
import { register } from "../controllers/usersController";

const userRoutes = Router();

userRoutes.post("/register", register);

export default userRoutes;
