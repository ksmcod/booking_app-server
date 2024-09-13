import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
const port = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({}));

app.get("/api/test", (req: Request, res: Response) => {
  res.json({ message: "Hello from express endpoint!" });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
