import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import { NODE_ENV } from "../constants/env";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { ErrorResponse } from "../types/types";
import { AppError } from "../utils/appError";

const handleZodError = (
  res: Response,
  error: z.ZodError,
  next: NextFunction
): void => {
  const errors = error.issues.map((issue) => ({
    message: `${issue.path.join(".")} - ${issue.message}`,
  }));

  res.status(BAD_REQUEST).json({ errors });
  next();
};

const handleAppError = (
  res: Response,
  error: AppError,
  next: NextFunction
): void => {
  res.status(error.statusCode).json({ message: error.message });
  next();
};

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Enhanced error logging
  console.error({
    path: req.path,
    method: req.method,
    error: {
      name: error.name,
      message: error.message,
      stack: NODE_ENV === "development" ? error.stack : undefined,
    },
  });

  // Zod Error
  if (error instanceof ZodError) {
    handleZodError(res, error, next);
    return;
  }

  // APP Error
  if (error instanceof AppError) {
    handleAppError(res, error, next);
    return;
  }

  // Unknown Error
  const response: ErrorResponse = {
    message: "Internal Server Error",
    stack: NODE_ENV === "development" ? error.stack : undefined,
  };

  res.status(INTERNAL_SERVER_ERROR).json(response);
  next();
};
