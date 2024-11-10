import { Router, Request, Response } from "express";
import { searchController } from "../controllers/hotelsController";

const hotelRoutes = Router();

// /api/hotels/search - API endpoint to search hotels
hotelRoutes.get("/search", searchController);

export default hotelRoutes;
