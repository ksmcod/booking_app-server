import jwt from "jsonwebtoken";

interface Payload {
  userId: string;
}

export default function createToken(payload: Payload) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "2 days",
  });
}
