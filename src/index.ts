import express, { Express, Request, Response, NextFunction } from "express";
import authRoutes from "./routes/auth/auth.routes";
import { errorHandler } from "./middleware/errorHandler";
import { config } from "dotenv";
config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Regular routes
app.use("/api/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "ok",
  });
});

// 404 handler for undefined routes
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Route not found" });
});
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
