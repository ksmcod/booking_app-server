import jwt from "jsonwebtoken";

export interface TokenPayload {
  userId: string;
}

export default function createToken(payload: TokenPayload) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "2 days",
  });
}
