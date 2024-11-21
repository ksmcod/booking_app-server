import { Hotel } from "@prisma/client";

export interface HotelSearchResponseType {
  hotels: Hotel[];
  totalNumberOfMatches: number;
  pagination: {
    pageNumber: number;
    itemsPerPage: number;
    pages: number;
  };
}

export enum SortByType {
  None = "none",
  STARRATING = "starRating",
  PRICELOWTOHIGH = "priceLowToHigh",
  PRICEHIGHTOLOW = "priceHighToLow",
}

export interface HotelQueryParamsType {
  country: string;
  city: string;
  adultCount: number;
  childrenCount: number;
  startDate: string;
  endDate: string;
  type: {
    in: string[];
  };
  starRating: {
    in: number[];
  };
  facilities: {
    hasEvery: string[];
  };
}

export interface HotelSortType {
  orderBy: {
    starRating?: "asc" | "desc";
    price?: "asc" | "desc";
  };
}
