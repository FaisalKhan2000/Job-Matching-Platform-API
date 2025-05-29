import express, { Express, Request, Response } from "express";
import authRoutes from "./routes/auth/auth.routes";

const app: Express = express();
const port: number = 3000;

app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "ok",
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
