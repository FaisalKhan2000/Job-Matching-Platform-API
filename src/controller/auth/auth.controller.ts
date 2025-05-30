import { Request, Response, NextFunction } from "express";
import { catchErrors } from "../../utils/catchErrors";
import { RegisterInput } from "../../schemas/auth.schema";
import { AppError } from "../../utils/appError";
import { NOT_FOUND } from "../../constants/http";

export const register = catchErrors(
  async (
    req: Request<{}, {}, RegisterInput>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, password, confirmPassword } = req.body;

    // accept and validate input
    // hash password
    // save user to database
    // return response

    // res.json({ name, email });
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
