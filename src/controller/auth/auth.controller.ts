import { Request, Response, NextFunction } from "express";
import { catchErrors } from "../../utils/catchErrors";
import { RegisterInput } from "../../schemas/auth.schema";

export const register = catchErrors(
  async (
    req: Request<{}, {}, RegisterInput>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, password, confirmPassword } = req.body;
  }
);
