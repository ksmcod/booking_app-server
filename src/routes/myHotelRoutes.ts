import { Router } from "express";
import multer from "multer";
import { createHotel } from "../controllers/myHotelsController";
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

// /api/my-hotels - To creat hotel
myHotelRoutes.post(
  "/",
  authMiddleware,
  upload.array("imageFiles", 5),
  hotelUploadMiddleware,
  createHotel
);

export default myHotelRoutes;
