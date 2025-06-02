import dotenv from "dotenv";
dotenv.config();
import express, { Express, Request, Response, NextFunction } from "express";
import authRoutes from "./routes/auth/auth.routes";
import { errorHandler } from "./middleware/errorHandler";
import { COOKIE_SECRET, PORT } from "./constants/env";
import { connectDB } from "./db/db";
import cookieParser from "cookie-parser";

const app: Express = express();

// Connect to database
connectDB();

app.use(express.json());
app.use(cookieParser(COOKIE_SECRET));

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
