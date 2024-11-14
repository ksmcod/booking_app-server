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

export interface HotelQueryParamsType {
  country: string;
  city: string;
  adultCount: number;
  childrenCount: number;
  startDate: string;
  endDate: string;
}
