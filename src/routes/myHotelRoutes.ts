import { Router } from "express";
import multer from "multer";
import { createHotel } from "../controllers/myHotelsController";

const myHotelRoutes = Router();
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5MB
  },
});

// /api/my-hotels
myHotelRoutes.post("/", upload.array("imageFiles", 5), createHotel);

export default myHotelRoutes;
