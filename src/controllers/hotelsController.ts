import { Request, Response } from "express";
import qs from "qs";
import Stripe from "stripe";

import db from "../utils/db";
import {
  BookHotelBodyType,
  HotelQueryParamsType,
  HotelSearchResponseType,
  HotelSortType,
  SortByType,
} from "../types";
import { Booking } from "@prisma/client";

// Controller function to search and filter searched hotels
export async function searchAndFilterController(req: Request, res: Response) {
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

// Controller function to get data of a single hotel
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

// Controller function to create Stripe payment intent
export async function createPaymentIntent(req: Request, res: Response) {
  // To create payment intent, we need;
  // 1. Total cost of the booking
  // 2. Hotel slug of the hotel for which we are creating a booking
  // 3. User id of the user creating the booking

  try {
    const stripe = new Stripe(process.env.STRIPE_API_KEY as string);
    const { numberOfNights } = req.query;
    const { slug } = req.params;

    if (!numberOfNights || !slug) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const hotel = await db.hotel.findUnique({ where: { slug } });

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const bookingDuration = !isNaN(parseInt(numberOfNights.toString()))
      ? parseInt(numberOfNights.toString())
      : 0;

    const totalCost = bookingDuration * hotel.price;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCost,
      currency: "usd",
      metadata: {
        slug,
        userId: req.userId as string,
      },
    });

    if (!paymentIntent.client_secret) {
      console.log("Error! No client secret found in payment intent");
      return res.status(500).json({ message: "An error occured" });
    }

    const response = {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret.toString(),
      totalCost,
    };

    res.status(200).json(response);
  } catch (error) {
    console.log("Error in ", req.url, " : ", error);
    res.status(500).json({ message: "An error occured" });
  }
}

// Controller function to create a booking provided it has been paid for
export async function createHotelBooking(req: Request, res: Response) {
  try {
    const stripe = new Stripe(process.env.STRIPE_API_KEY as string);
    const userId = req.userId as string;

    const {
      paymentIntentId,
      slug,
      checkinDate,
      checkoutDate,
      adultCount,
      childrenCount,
      totalPrice,
    }: BookHotelBodyType = req.body;

    console.log("THE REQUEST BODY: ", req.body);

    if (
      !paymentIntentId ||
      !slug ||
      !checkinDate ||
      !checkoutDate ||
      !adultCount ||
      adultCount < 1 ||
      (childrenCount && childrenCount < 0) ||
      !totalPrice
    ) {
      return res.status(400).json({ message: "Incomplete payload" });
    }

    if (
      isNaN(new Date(parseInt(checkinDate)).getTime()) ||
      isNaN(new Date(parseInt(checkoutDate)).getTime())
    ) {
      return res
        .status(400)
        .json({ message: "Invalid dates for checkin and/or checkout" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return res.status(400).json({ message: "Payment intent not found" });
    }

    if (
      paymentIntent.metadata.slug !== slug ||
      paymentIntent.metadata.userId !== req.userId
    ) {
      return res.status(400).json({ message: "Payment intent mismatch" });
    }

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        message: `Payment not successful. Status: ${paymentIntent.status}`,
      });
    }

    const hotel = await db.hotel.findUnique({ where: { slug } });

    if (!hotel) {
      return res.status(404).json({ message: "Hotel was not found" });
    }

    const newBooking = await db.booking.create({
      data: {
        checkinDate: new Date(parseInt(checkinDate)),
        checkoutDate: new Date(parseInt(checkoutDate)),
        totalPrice,
        adultCount,
        childrenCount,
        userId: userId,
        hotelId: hotel.id,
      },
    });

    return res.status(201).json({ message: "Booking created successfully" });
  } catch (error) {
    console.log("Error in ", req.url, " : ", error);
    res.status(500).json({ message: "An error occured" });
  }
}
