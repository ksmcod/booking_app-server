import { Request, Response } from "express";
import cloudinary from "cloudinary";

export async function createHotel(req: Request, res: Response) {
  try {
    const imageFiles = req.files as Express.Multer.File[];

    const uploadPromises = imageFiles.map(async (image) => {
      const b64 = Buffer.from(image.buffer).toString("base64");
      let dataURI = "data:" + image.mimetype + ";base64," + b64;

      const response = await cloudinary.v2.uploader.upload(dataURI, {
        folder: "trippr",
      });
      return response.url;
    });

    const imageUrls = await Promise.all(uploadPromises);
    res.status(200).json(imageUrls);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An internal server error occured!" });
  }
}
