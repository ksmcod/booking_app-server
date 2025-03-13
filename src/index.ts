import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
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
import slugRoutes from "./routes/slugRoutes";
import hotelRoutes from "./routes/hotelRoutes";

const app = express();
const PORT = 8080;

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

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
const allowedOrigins = [
  process.env.CLIENT_URL as string,
  process.env.SERVER_URL as string,
  "https://github.com",
];

const corsOptions: CorsOptions = {
  origin(requestOrigin, callback) {
    // Allow only requests from specific origins

    if (process.env.NODE_ENV == "development") {
      return callback(null, true);
    } else {
      console.log("REQUEST_ORIGIN: ", requestOrigin);
      console.log(
        "REQUEST_ORIGIN ALLOWED",
        allowedOrigins.includes(requestOrigin || "")
      );

      if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Denied by CORS!"));
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
  ],
};

app.use(cors(corsOptions));

// Configure morgan middleware for logging
// if (process.env.NODE_ENV !== "production") {
// }
app.use(morgan("dev"));

// Display origin
// app.use("*", (req: Request, res: Response, next: NextFunction) => {
//   console.log("Request origin: ", req.headers.origin);
//   console.log("Request cookies: ", req.cookies);
//   next();
// });

// Configure Passport middleware
app.use(passport.initialize());

// Setup Passport strategies
githubStrategy(passport);

// Configure static assets
const clientPath = path.join(__dirname, "frontend");
app.use(express.static(clientPath));

// Routing begins
// app.get("/client", (req: Request, res: Response) => {
//   res.redirect((process.env.CLIENT_URL as string) || "/");
// });

// app.get("/api/test", (req: Request, res: Response) => {
//   res.json({ message: "Hello from express endpoint!" });
// });

// app.get("/api/echo/:message", (req: Request, res: Response) => {
//   const { message } = req.params;
//   return res.status(200).json({ message });
// });

// Configure authentication routes
app.use("/api/auth", authRoutes);

// Configure routes
app.use("/api/users", userRoutes);

// Configure my-hotel routes
app.use("/api/my-hotels", myHotelRoutes);

// Configure hotel routes
app.use("/api/hotels", hotelRoutes);

// Add slugs to hotels not having slugs
app.use("/api/slugs", slugRoutes);

// Catch all route
app.use("/api/*", (req: Request, res: Response) => {
  return res.status(404).json({ message: "Resource not found" });
});

// Serve client for non-api routes
app.use("*", (req: Request, res: Response) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err && (err.message as string).includes("CORS")) {
    return res.status(403).json({ message: err.message });
  }

  res.status(500).json({ message: err.message ?? "A server error occured!" });
});

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
