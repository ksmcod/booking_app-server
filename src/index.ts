import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import userRoutes from "./routes/userRoutes";
import passport from "passport";
import { githubStrategy } from "./config/passport";

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

app.get("/api/test", (req: Request, res: Response) => {
  res.json({ message: "Hello from express endpoint!" });
});

// Configure routes

app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
