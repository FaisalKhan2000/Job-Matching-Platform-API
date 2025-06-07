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
import {
  updateCurrentUserPasswordSchema,
  updateUserSchema,
} from "../validations/user.schema";

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

export type currentUserServiceType = {
  userId: string;
  res: Response;
};

export type updateCurrentUserServiceType = {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

export type updateCurrentUserPasswordServiceType = {
  userId: string;
  password: string;
};

// validation types
export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;

export type updateUserInput = z.infer<typeof updateUserSchema>;

export type updateUserPasswordInput = z.infer<
  typeof updateCurrentUserPasswordSchema
>;

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

// mail input
export type SendEmailInput = {
  from: {
    address: string;
    name: string;
  };
  to: string[];
  subject: string;
  text?: string;
  html?: string;
  category: 'Email Verification' | 'Password Reset',
  sandbox: boolean,
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
