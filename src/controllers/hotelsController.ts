import { Request, Response } from "express";
import db from "../utils/db";
import { HotelQueryParamsType, HotelSearchResponseType } from "../types";

export async function searchController(req: Request, res: Response) {
  try {
    const itemsPerPage = 5;
    const pageNumber = parseInt(req.query.page?.toString() ?? "1");

    const skip = (pageNumber - 1) * itemsPerPage;

    // GET query parameters from url
    const queryParameters: Partial<HotelQueryParamsType> = {};

    queryParameters.adultCount = parseInt(
      req.query.adultCount?.toString() || "1"
    );
    queryParameters.childrenCount = parseInt(
      req.query.childrenCount?.toString() || "0"
    );

    if (req.query.country && req.query.country.length) {
      queryParameters.country = req.query.country.toString();
    }

    if (req.query.city && req.query.city.length) {
      queryParameters.city = req.query.city.toString();
    }

    // Total number of hotels that fit query criteria
    const totalMatches = await db.hotel.findMany({
      where: {
        ...queryParameters,
        adultCount: { gte: queryParameters.adultCount },
        childrenCount: { gte: queryParameters.childrenCount },
      },
    });

    const totalNumberOfMatches = totalMatches.length;

    // Getting hotels to respond back to the user
    const hotels = await db.hotel.findMany({
      skip: skip,
      take: itemsPerPage,
      where: {
        ...queryParameters,
        adultCount: { gte: queryParameters.adultCount },
        childrenCount: { gte: queryParameters.childrenCount },
      },
    });

    // Return response back to user
    const response: HotelSearchResponseType = {
      hotels,
      totalNumberOfMatches: totalNumberOfMatches,
      pagination: {
        pageNumber,
        itemsPerPage,
        pages: Math.ceil(totalNumberOfMatches / itemsPerPage),
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log("Error in search: ", error);
    res.status(500).json({ message: "A server error occured" });
  }
}
