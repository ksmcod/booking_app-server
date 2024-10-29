import { Router } from "express";
import { addSlugs } from "../controllers/addSlugsController";

const slugRoutes = Router();

slugRoutes.get("/add-slugs", addSlugs);

export default slugRoutes;
