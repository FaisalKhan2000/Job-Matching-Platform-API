import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import express, { Express, NextFunction, Request, Response } from "express";
import passport from "passport";
import { configurePassport } from "./configs/passport";
import { COOKIE_SECRET, PORT } from "./constants/env";
import { connectDB } from "./db/db";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import companyRoutes from "./routes/company.routes";

const app: Express = express();

// Connect to database
connectDB();

app.use(express.json());
app.use(cookieParser(COOKIE_SECRET));
app.use(passport.initialize());
configurePassport(passport);

// Regular routes

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);

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
