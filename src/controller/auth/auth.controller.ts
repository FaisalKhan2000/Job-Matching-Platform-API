import { Request, Response, NextFunction } from "express";
import { catchErrors } from "../../utils/catchErrors";
import { RegisterInput, registerSchema } from "../../validations/auth.schema";
import { hashPassword } from "../../utils/password";
import { AppError } from "../../utils/appError";
import { BAD_REQUEST, CREATED } from "../../constants/http";
import { createToken } from "../../utils/jwt";

export const register = catchErrors(
  async (
    req: Request<{}, {}, RegisterInput>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, password } = req.body;

    // Check if user already exists

    // Hash password

    // Create new user

    // Generate JWT token

    // Return response
  }
);

export const login = catchErrors(
  async (
    req: Request<{}, {}, RegisterInput>,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password } = req.body;

    // accept and validate input
    // find user in database
    // compare password
    // generate auth token (jwt)
    // set cookie
    // return response

    // res.json({ name, email });
  }
);
