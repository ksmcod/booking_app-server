/* The purpose of this middleware is to check that all fields required when creating a hotel are filled  */

import { NextFunction, Request, Response } from "express";

import { Hotel } from "@prisma/client";

export type HotelBodyType = Omit<
  Hotel,
  "id" | "imageUrls" | "createdAt" | "updatedAt" | "userId"
>;

export default function hotelUploadMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {
    name,
    city,
    country,
    description,
    type,
    adultCount,
    childrenCount,
    facilities,
    price,
    starRating,
  }: HotelBodyType = req.body;

  if (
    !name ||
    !city ||
    !country ||
    !description ||
    !type ||
    !adultCount ||
    !childrenCount ||
    !facilities ||
    !price ||
    !starRating
  ) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  if (
    typeof adultCount !== "number" ||
    typeof childrenCount !== "number" ||
    typeof price !== "number"
  ) {
    return res.status(400).json({ message: "Incorrect types" });
  }

  next();
}
