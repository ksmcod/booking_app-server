import { Request, Response } from "express";
import cloudinary from "cloudinary";
import slugify from "slugify";
import { nanoid } from "nanoid";

import db from "../utils/db";
import { HotelBodyType } from "../middleware/hotelUploadMiddleware";

// Controller function to create a new hotel
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
        folder: "trippr/hotels",
      });
      return response.url;
    });

    const imageUrls = await Promise.all(uploadPromises);

    const slug = slugify(`${name}-${nanoid(5)}`, {
      lower: true,
      strict: true,
    });

    await db.hotel.create({
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
        slug,
      },
    });

    res.status(201).json({ message: "Hotel created successfully" });
  } catch (error) {
    console.log("Error creating hotel: ", error);
    res.status(500).json({ message: "An internal server error occured!" });
  }
}

// Controller function to get all hotels owned by a single user!
export async function getUserHotels(req: Request, res: Response) {
  try {
    const userId = req.userId as string;

    const userHotels = await db.hotel.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        description: true,
        type: true,
        adultCount: true,
        childrenCount: true,
        facilities: true,
        price: true,
        starRating: true,
        imageUrls: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json(userHotels);
  } catch (error) {
    console.log("Error getting user hotels: ", error);
    res.status(500).json({ message: "An internal server error occured" });
  }
}

// Controller function to get a single hotel, owned by the user
export async function getOneUserHotel(req: Request, res: Response) {
  try {
    const slug = req.params.slug.toString();
    const userId = req.userId as string;

    const hotel = await db.hotel.findFirst({
      where: {
        slug,
        userId,
      },
    });

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    return res.status(200).json(hotel);
  } catch (error) {
    console.log("Error in fetching single hotel");
    res.status(500).json({ message: "An error occured" });
  }
}

// Controller function to update a single hotel
export async function updateOneUserHotel(req: Request, res: Response) {
  try {
    const slug = req.params.slug.toString();
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
      imageUrls,
    }: HotelBodyType = req.body;

    const imageFiles = req.files as Express.Multer.File[];

    if (imageFiles.length + imageUrls.length > 5) {
      return res
        .status(400)
        .json({ message: "You may only have a maximum of five (5) images" });
    }

    if (imageFiles.length + imageUrls.length === 0) {
      return res
        .status(400)
        .json({ message: "Please upload at least one image of your hotel" });
    }

    const uploadPromises = imageFiles.map(async (image) => {
      const b64 = Buffer.from(image.buffer).toString("base64");
      let dataURI = "data:" + image.mimetype + ";base64," + b64;

      const response = await cloudinary.v2.uploader.upload(dataURI, {
        folder: "trippr/hotels",
      });
      return response.url;
    });

    const newImageUrls = await Promise.all(uploadPromises);
    const finalImageUrls = imageUrls.concat(newImageUrls);

    const hotel = await db.hotel.findUnique({
      where: {
        slug: slug,
        userId,
      },
    });

    if (!hotel) {
      return res.status(404).json({ message: "No hotel found" });
    }

    const updatedHotel = await db.hotel.update({
      where: {
        id: hotel.id,
      },
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
        imageUrls: finalImageUrls,
      },
    });

    console.log("Updated Hotel: ", updatedHotel);

    res.status(200).json({ message: "Hotel updated successfully" });
  } catch (error) {}
}
