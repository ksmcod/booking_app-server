import { Request, Response } from "express";
import db from "../utils/db";
import { HotelSearchResponse } from "../types";

export async function searchController(req: Request, res: Response) {
  try {
    const itemsPerPage = 10;
    const pageNumber = parseInt(req.query.page?.toString() ?? "1");

    const skip = (pageNumber - 1) * itemsPerPage;

    const hotels = await db.hotel.findMany({ skip: skip, take: itemsPerPage });
    const total = await db.hotel.count();

    const response: HotelSearchResponse = {
      hotels,
      pagination: {
        pageNumber,
        itemsPerPage,
        pages: Math.ceil(total / itemsPerPage),
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log("Error in search: ", error);
    res.status(500).json({ message: "A server error occured" });
  }
}
