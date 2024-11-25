import { Router, Request, Response } from "express";
import {
  createPaymentIntent,
  getSingleHotel,
  searchController,
} from "../controllers/hotelsController";
import authMiddleware from "../middleware/authMiddleware";

const hotelRoutes = Router();

// /api/hotels/search - API endpoint to search hotels
hotelRoutes.get("/search", searchController);

// /api/hotels/:slug - API endpoint to get hotel by slug
hotelRoutes.get("/:slug", getSingleHotel);

// - API endpoint to create STRIPE payment intent
hotelRoutes.get(
  "/stripe/payment-intent/:slug",
  authMiddleware,
  createPaymentIntent
);

export default hotelRoutes;
