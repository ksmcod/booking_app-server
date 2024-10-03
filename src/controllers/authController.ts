import { Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import db from "../utils/db";

import createToken from "../utils/createToken";
import setToken from "../utils/setToken";

interface LoginRequestBody {
  email: string;
  password: string;
}

// CREDENTIALS LOGIN CONTROLLER FUNCTION
export async function loginController(req: Request, res: Response) {
  const { email, password }: LoginRequestBody = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please fill all required fields!" });
  }

  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = createToken({ userId: user.id });
    setToken(token, res);

    res
      .status(200)
      .json({ name: user.name, email: user.email, image: user.image });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured!" });
  }
}

// GET info of authenticated user
export async function getAuthUser(req: Request, res: Response) {
  const userId = req.user as string;

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  res
    .status(200)
    .json({ name: user.name, email: user.email, image: user.image });
}

// Check token validity
export async function checkToken(req: Request, res: Response) {
  const userId = req.user;
  res.status(200).json({ userId });
}

// Logout controller function
export async function logout(req: Request, res: Response) {
  res.clearCookie("user_token");
  res.status(200).json({ message: "Logout successful" });
}
