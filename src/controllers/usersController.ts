import { Request, Response } from "express";
import bcrypt from "bcrypt";
import db from "../utils/db";
import setToken from "../utils/setToken";
import createToken from "../utils/createToken";
import { request } from "http";

interface RegisterRequestBody {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

// REGISTER CONTROLLER FUNCTION
export async function registerController(req: Request, res: Response) {
  const { email, firstName, lastName, password }: RegisterRequestBody =
    req.body;

  if (!email || !firstName || !lastName || !password) {
    return res
      .status(400)
      .json({ message: "Please fill all required fields!" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password should be at least 8 characters long!" });
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (user) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        password: hashedPassword,
      },
    });

    const token = createToken({ userId: newUser.id });
    setToken(token, res);
    res
      .status(201)
      .json({ name: newUser.name, email: newUser.email, image: newUser.image });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
}

// GET CURRENT USER INFO CONTROLLER FUNCTION
export async function getUserInfo(req: Request, res: Response) {
  const userId = req.userId as string;

  const user = await db.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
      image: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "Unauthorized" });
  }

  return res.json(user);
}
