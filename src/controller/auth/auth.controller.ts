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
    throw new AppError(NOT_FOUND, "jnsmxjanjansja");
    // const { name, email, password, confirmPassword } = req.body;

    // res.json({ name, email });
  }
);
