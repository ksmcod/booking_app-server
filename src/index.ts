import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import passport from "passport";
import { v2 as cloudinary } from "cloudinary";

import path from "path";

import db from "./utils/db";

import userRoutes from "./routes/userRoutes";
import { githubStrategy } from "./config/passport";
import authRoutes from "./routes/authRoutes";
import myHotelRoutes from "./routes/myHotelRoutes";

const app = express();
const PORT = 8080;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure cookie-parser middleware
app.use(cookieParser());

// Configure CORS middleware
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));

// Configure morgan middleware for logging
app.use(morgan("dev"));

// Configure Passport middleware
app.use(passport.initialize());

// Setup Passport strategies
githubStrategy(passport);

// Configure static assets
// app.use(express.static(path.join(__dirname, "..", "client", "out")));

// Routing begins
app.get("/client", (req: Request, res: Response) => {
  res.redirect((process.env.CLIENT_URL as string) || "/");
});

app.get("/api/test", (req: Request, res: Response) => {
  res.json({ message: "Hello from express endpoint!" });
});

// Configure authentication routes
app.use("/api/auth", authRoutes);

// Configure routes
app.use("/api/users", userRoutes);

// Configure my-hotel routes
app.use("/api/my-hotels", myHotelRoutes);

// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   console.log("GLOBAL ERROR MAN!");

//   if (err) {
//     console.log("IF -> GLOBAL ERROR MAN");
//   }
//   res.status(500).json({ message: "A server error occured!" });
// });

app.listen(PORT, () => {
  db.$connect()
    .then(() => {
      // console.log("Connected to: ", process.env.DATABASE_URL);
      console.log(`Listening on port ${PORT}`);
    })
    .catch((error) => {
      console.log("ERROR CONNECTING TO DB");
    });
});
