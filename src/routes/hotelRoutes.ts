import { Router, Request, Response } from "express";
import {
  getSingleHotel,
  searchController,
} from "../controllers/hotelsController";

const hotelRoutes = Router();

// /api/hotels/search - API endpoint to search hotels
hotelRoutes.get("/search", searchController);
hotelRoutes.get("/:slug", getSingleHotel);

export default hotelRoutes;
