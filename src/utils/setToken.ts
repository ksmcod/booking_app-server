import { Response } from "express";

export default function setToken(token: string, res: Response) {
  res.cookie("user_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production",
    maxAge: 172800000,
    sameSite: "lax",
    domain: process.env.WEB_DOMAIN as string,
  });
}
