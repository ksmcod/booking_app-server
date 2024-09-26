import { Request, Response } from "express";
import bcrypt from "bcrypt";
import db from "../utils/db";
import setToken from "../utils/setToken";

interface RequestBody {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export async function register(req: Request, res: Response) {
  const { email, firstName, lastName, password }: RequestBody = req.body;

  if (!email || !firstName || !lastName || !password) {
    return res
      .status(400)
      .json({ message: "Please fill all required fields!" });
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (user) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
      },
    });

    setToken({ userId: newUser.id }, res);
    res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
}
