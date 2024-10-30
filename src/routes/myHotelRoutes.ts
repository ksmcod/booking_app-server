import { Router } from "express";
import multer from "multer";
import {
  createHotel,
  getOneUserHotel,
  getUserHotels,
} from "../controllers/myHotelsController";
import hotelUploadMiddleware from "../middleware/hotelUploadMiddleware";
import authMiddleware from "../middleware/authMiddleware";

const myHotelRoutes = Router();
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5MB
  },
});

// /api/my-hotels - To create hotel
myHotelRoutes.post(
  "/",
  authMiddleware,
  upload.array("imageFiles", 5),
  hotelUploadMiddleware,
  createHotel
);

// /api/my-hotels - To get all hotels from a single user

myHotelRoutes.get("/", authMiddleware, getUserHotels);

// /api/:slug - To get a single hotel from the slug. Make sure the hotel belongs to current user!
myHotelRoutes.get("/:slug", authMiddleware, getOneUserHotel);

export default myHotelRoutes;
