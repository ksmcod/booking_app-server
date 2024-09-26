import { Response } from "express";
import jwt from "jsonwebtoken";

interface Payload {
  userId: string;
}

export default function setToken(paylaod: Payload, res: Response) {
  const token = jwt.sign(paylaod, process.env.JWT_SECRET as string, {
    expiresIn: 60,
  });
  res.cookie("user_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60000,
  });
}
