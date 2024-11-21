import { Request, Response } from "express";
import qs from "qs";

import db from "../utils/db";
import {
  HotelQueryParamsType,
  HotelSearchResponseType,
  HotelSortType,
  SortByType,
} from "../types";

export async function searchController(req: Request, res: Response) {
  try {
    const itemsPerPage = 5;

    //What result page the user is on
    const pageNumber = parseInt(req.query.page?.toString() ?? "1");

    const skip = (pageNumber - 1) * itemsPerPage;

    //////////////////////////////////////////////////////
    // GET query parameters from url

    // This object will be spread into the prisma query function as an option object for querying. Hence it has thesame structure as the prisma options object, so it causes no errors
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

    ////////////////////////////////////////////////////
    // GET filter params from url

    // Objects will be spread into the prisma query function as option objects for filtering. Hence they has thesame structure as the prisma options object, so it causes no errors

    // Filter hotels based on stars
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

    // Filter hotels based on hotel type
    const selectedHotelTypesObj = qs.parse(
      req.query.selectedHotelTypes?.toString() || {}
    );
    const selectedHotelTypes = Object.values(selectedHotelTypesObj).map(String);

    if (selectedHotelTypes.length) {
      queryParameters.type = {
        in: selectedHotelTypes,
      };
    }

    // Filter hotels according to facilities
    const selectedFacilitiesObj = qs.parse(
      req.query.selectedFacilities?.toString() || ""
    );
    const selectedFacilities = Object.values(selectedFacilitiesObj).map(String);

    if (selectedFacilities.length) {
      queryParameters.facilities = {
        hasEvery: selectedFacilities,
      };
    }

    ////////////////////////////////////////////////////////
    // SORT Hotels

    // This object will be spread into the prisma query function as an option object for sorting. Hence it has thesame structure as the prisma options object, so it causes no errors

    let sortFilters: Partial<HotelSortType> = {};

    const sortBy = req.query.sortBy?.toString() || SortByType.None;

    if (sortBy === SortByType.STARRATING) {
      sortFilters = { orderBy: { starRating: "desc" } };
    }

    if (sortBy === SortByType.PRICELOWTOHIGH) {
      sortFilters = { orderBy: { price: "asc" } };
    }

    if (sortBy === SortByType.PRICEHIGHTOLOW) {
      sortFilters = { orderBy: { price: "desc" } };
    }

    ////////////////////////////////////////////////////////
    // Total number of hotels that fit query criteria
    const totalNumberOfMatches = await db.hotel.count({
      where: {
        ...queryParameters,
        adultCount: { gte: queryParameters.adultCount },
        childrenCount: { gte: queryParameters.childrenCount },
      },
    });

    // Getting hotels to respond back to the user
    const hotels = await db.hotel.findMany({
      skip: skip,
      take: itemsPerPage,
      where: {
        ...queryParameters,
        adultCount: { gte: queryParameters.adultCount },
        childrenCount: { gte: queryParameters.childrenCount },
      },
      ...sortFilters,
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

export async function getSingleHotel(req: Request, res: Response) {
  try {
    const { slug } = req.params;

    const hotel = await db.hotel.findUnique({
      where: {
        slug,
      },
    });

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    return res.status(200).json(hotel);
  } catch (error) {
    console.log("Error in get single hotel");
    res.status(500).json({ message: "An error occured" });
  }
}
