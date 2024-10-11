/* The purpose of this middleware is to check that all fields required when creating a hotel are filled  */

import { NextFunction, Request, Response } from "express";

import { Hotel } from "@prisma/client";

type BodyType = Omit<
  Hotel,
  "id" | "imageUrls" | "createdAt" | "updatedAt" | "userId"
>;

export default function hotelMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const body: BodyType = req.body;

  if (
    !body.name ||
    !body.city ||
    !body.country ||
    !body.description ||
    !body.type ||
    !body.adultCount ||
    !body.childCount ||
    !body.facilities ||
    !body.price ||
    !body.starRating
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  next();
}
