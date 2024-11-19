import { Request, Response } from "express";
import qs from "qs";

import db from "../utils/db";
import { HotelQueryParamsType, HotelSearchResponseType } from "../types";

export async function searchController(req: Request, res: Response) {
  try {
    const itemsPerPage = 5;
    const pageNumber = parseInt(req.query.page?.toString() ?? "1");

    const skip = (pageNumber - 1) * itemsPerPage;

    console.log("Query params: ", req.query);

    const queryParameters: Partial<HotelQueryParamsType> = {};

    // GET query parameters from url
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

    ////////////////////////////////////////////////////
    // GET filter params from url
    const selectedStarsObj = qs.parse(
      req.query.selectedStars?.toString() || {}
    );
    const selectedStars = Object.values(selectedStarsObj)
      .map(Number)
      .filter((num) => !isNaN(num));

    if (selectedStars.length) {
      queryParameters.starRating = {
        in: selectedStars,
      };
    }

    const selectedHotelTypesObj = qs.parse(
      req.query.selectedHotelTypes?.toString() || {}
    );
    const selectedHotelTypes = Object.values(selectedHotelTypesObj).map(String);

    if (selectedHotelTypes.length) {
      queryParameters.type = {
        in: selectedHotelTypes,
      };
    }

    ////////////////////////////////////////////////////////
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
