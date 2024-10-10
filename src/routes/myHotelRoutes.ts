import { Router } from "express";
import multer from "multer";
import { createHotel } from "../controllers/myHotelsController";

const router = Router();
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5MB
  },
});

// /api/my-hotels
router.post("/my-hotels", upload.array("imageFiles", 5), createHotel);
