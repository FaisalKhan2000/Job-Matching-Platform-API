import { loginSchema, registerSchema } from "../validations/auth.schema";
import { OK, z } from "zod/dist/types";
import {
  BAD_REQUEST,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  CREATED,
  CONFLICT,
  UNPROCESSABLE_CONTENT,
  TOO_MANY_REQUESTS,
  INTERNAL_SERVER_ERROR,
} from "../constants/http";
import { Response } from "express";
import { usersTable } from "../db/tables/user.table";
import { InferModel } from "drizzle-orm";

// service types
export type registerServiceType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  res: Response;
};
export type loginServiceType = {
  email: string;
  password: string;
  res: Response;
};

// validation types
export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;

// middleware types
export type ErrorResponse = {
  message: string;
  errors?: Array<{ message: string }>;
  stack?: string;
};

// utility types
export type JwtPayload = {
  userId: string;
  role: string;
  email: string;
};

// statuscode types
export type HttpStatusCode =
  | typeof OK
  | typeof CREATED
  | typeof BAD_REQUEST
  | typeof UNAUTHORIZED
  | typeof FORBIDDEN
  | typeof NOT_FOUND
  | typeof CONFLICT
  | typeof UNPROCESSABLE_CONTENT
  | typeof TOO_MANY_REQUESTS
  | typeof INTERNAL_SERVER_ERROR;
