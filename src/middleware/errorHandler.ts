import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { z, ZodError } from "zod";

const handleZodError = (res: Response, error: z.ZodError) => {
  const errors = error.issues.map((issue) => ({
    message: `${issue.path.join(".")} is ${issue.message}`,
  }));

  return res.status(BAD_REQUEST).json({ errors });
};

const handleAppError = (res: Response, error: AppError) => {
  return res.status(error.statusCode).json({ message: error.message });
};

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(`PATH: ${req.path}`, error);

  // Zod Error
  if (error instanceof ZodError) {
    handleZodError(res, error);
  }

  // APP Error
  if (error instanceof AppError) {
    handleAppError(res, error);
  } else {
    res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};
