import { Request, Response } from "express";
import slugify from "slugify";
import { nanoid } from "nanoid";

import db from "../utils/db";
import { Hotel } from "@prisma/client";

export async function addSlugs(req: Request, res: Response) {
  const unSluggedHotels = await db.hotel.findMany({});

  if (!unSluggedHotels || !unSluggedHotels.length) {
    res.status(200).json({ message: "No hotels" });
  }
  const updatedHotels = await Promise.all(
    unSluggedHotels.map(async (hotel) => {
      const slug = slugify(`${hotel.name}-${nanoid(5)}`, {
        lower: true,
        strict: true,
      });

      return await db.hotel.update({
        where: { id: hotel.id },
        data: { slug },
      });
    })
  );
  res.status(200).json(updatedHotels);
}
