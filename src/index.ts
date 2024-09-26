import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import userRoutes from "./routes/userRoutes";

const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({}));

app.get("/api/test", (req: Request, res: Response) => {
  res.json({ message: "Hello from express endpoint!" });
});

// Configure routes

app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
