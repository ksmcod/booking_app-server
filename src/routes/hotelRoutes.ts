import { Router, Request, Response } from "express";
import {
  createHotelBooking,
  createPaymentIntent,
  getAllBookings,
  getSingleHotel,
  searchAndFilterController,
} from "../controllers/hotelsController";
import authMiddleware from "../middleware/authMiddleware";

const hotelRoutes = Router();

// GET  /api/hotels/search - API endpoint to search hotels
hotelRoutes.get("/search", searchAndFilterController);

// GET /api/hotels/:slug - API endpoint to get hotel by slug
hotelRoutes.get("/:slug", getSingleHotel);

// POST /api/hotels/book
hotelRoutes.post("/book", authMiddleware, createHotelBooking);

// - /api/hotels/payment/payment-intent/ API endpoint to create STRIPE payment intent
hotelRoutes.get(
  "/payment/payment-intent/:slug",
  authMiddleware,
  createPaymentIntent
);

// GET /api/hotels/bookings - API endpoint to get all bookings of a single user
hotelRoutes.get("/bookings", authMiddleware, getAllBookings);

export default hotelRoutes;
