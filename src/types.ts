import { Hotel } from "@prisma/client";

export interface HotelSearchResponse {
  hotels: Hotel[];
  pagination: {
    pageNumber: number;
    itemsPerPage: number;
    pages: number;
  };
}
