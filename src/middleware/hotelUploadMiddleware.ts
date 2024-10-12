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

  if (typeof adultCount !== "number")
    req.body.adultCount = parseInt(adultCount);
  if (typeof childrenCount !== "number")
    req.body.childrenCount = parseInt(childrenCount);
  if (typeof price !== "number") req.body.price = parseInt(price);
  if (typeof starRating !== "number")
    req.body.starRating = parseInt(starRating);

  console.log("The body for hotel upload is: ", req.body);
  console.log("NAN is number: ", typeof NaN === "number");

  if (
    typeof req.body.adultCount !== "number" ||
    Number.isNaN(req.body.adultCount) ||
    typeof req.body.childrenCount !== "number" ||
    Number.isNaN(req.body.childrenCount) ||
    typeof req.body.price !== "number" ||
    Number.isNaN(req.body.price)
  ) {
    return res.status(400).json({ message: "Incorrect types" });
  }

  next();
}
