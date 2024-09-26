import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface Payload {
  userId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

export default async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.user_token;

  if (!token) {
    res.sendStatus(401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as Payload;

    // Attach the userId to the request object
    req.user = { userId: decoded.userId };

    next();
  } catch (error: any) {
    console.log("JWT verification error: ", error);
    res.status(401).json({ message: error.message ?? "Invalid token" });
  }
}
