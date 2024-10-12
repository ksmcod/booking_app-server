import { Request, Response } from "express";
import cloudinary from "cloudinary";

import db from "../utils/db";
import { HotelBodyType } from "../middleware/hotelUploadMiddleware";

export async function createHotel(req: Request, res: Response) {
  try {
    const userId = req.userId as string;
    const {
      name,
      city,
      country,
      description,
      type,
      facilities,
      adultCount,
      childrenCount,
      price,
      starRating,
    }: HotelBodyType = req.body;

    const imageFiles = req.files as Express.Multer.File[];

    if (imageFiles.length === 0) {
      return res
        .status(400)
        .json({ message: "Please upload at least one image of your hotel" });
    }

    if (imageFiles.length > 5) {
      return res
        .status(400)
        .json({ message: "You may only upload a maximum of five (5) images" });
    }

    const uploadPromises = imageFiles.map(async (image) => {
      const b64 = Buffer.from(image.buffer).toString("base64");
      let dataURI = "data:" + image.mimetype + ";base64," + b64;

      const response = await cloudinary.v2.uploader.upload(dataURI, {
        folder: "trippr",
      });
      return response.url;
    });

    const imageUrls = await Promise.all(uploadPromises);

    const newHotel = await db.hotel.create({
      data: {
        name,
        city,
        country,
        description,
        type,
        facilities,
        adultCount,
        childrenCount,
        price,
        starRating,
        imageUrls,
        userId,
      },
    });

    res.status(201).json(newHotel);
  } catch (error) {
    console.log("Error creating hotel: ", error);
    res.status(500).json({ message: "An internal server error occured!" });
  }
}
