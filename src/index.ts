import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import userRoutes from "./routes/userRoutes";
import passport from "passport";
import { githubStrategy } from "./config/passport";
import authRoutes from "./routes/auth";

const app = express();
const PORT = 8080;

// Configure express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure CORS middleware
app.use(cors({}));

// Configure Passport middleware
app.use(passport.initialize());

// Setup Passport strategies
githubStrategy(passport);

// Routing begins
app.get("/client", (req: Request, res: Response) => {
  res.redirect(process.env.CLIENT_URL as string);
});

app.get("/api/test", (req: Request, res: Response) => {
  res.json({ message: "Hello from express endpoint!" });
});

// Configure auth routes
app.use("/api/auth", authRoutes);

// Configure routes
app.use("/api/users", userRoutes);

// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   console.log("GLOBAL ERROR MAN!");

//   if (err) {
//     console.log("IF -> GLOBAL ERROR MAN");
//   }
//   res.status(500).json({ message: "A server error occured!" });
// });

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
