import { Response } from "express";
import { OK, z } from "zod/dist/types";
import {
  BAD_REQUEST,
  CONFLICT,
  CREATED,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
  UNPROCESSABLE_CONTENT,
} from "../constants/http";
import { loginSchema, registerSchema } from "../validations/auth.schema";
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
  updateCurrentUserPasswordSchema,
  updateUserSchema,
} from "../validations/user.schema";
import { companySchema } from "../validations/company.schema";

// service types

// auth
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

export type promoteToRecruiterServiceType = {
  userId: string;
};

export type SendEmailVerificationServiceType = {
  userId: string;
};

export type verifyEmailServiceType = {
  userId: string;
  token: string;
};

export type requestPasswordResetServiceType = {
  userId: string;
};

export type resetPasswordServiceType = {
  userId: string;
  password: string;
  token: string;
};

// company
export type createCompanyServiceType = {
  userId: string;
  company: createCompanyInput;
};

export type getCompanyServiceType = {
  companyId: string;
};

export type listCompaniesInput = {
  search?: string;
  page?: number;
  limit?: number;
  founded_year?: string;
  company_size?: string;
};

// validation types

// user
export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;

export type updateUserInput = z.infer<typeof updateUserSchema>;

export type updateUserPasswordInput = z.infer<
  typeof updateCurrentUserPasswordSchema
>;

export type requestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>;

export type resetPasswordInput = z.infer<typeof resetPasswordSchema>;

// company
export type createCompanyInput = z.infer<typeof companySchema>;

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
  category: "Email Verification" | "Password Reset";
  sandbox: boolean;
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
