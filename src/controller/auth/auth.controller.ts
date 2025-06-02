import { Request, Response, NextFunction } from "express";
import { catchErrors } from "../../utils/catchErrors";
import { RegisterInput } from "../../validations/auth.schema";
import { registerService } from "../../services/auth/auth.service";
import { CREATED } from "../../constants/http";

export const register = catchErrors(
  async (
    req: Request<{}, {}, RegisterInput>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, password } = req.body;

    const { userWithoutPassword, token } = await registerService({
      name,
      email,
      password,
      res,
    });

    return res.status(CREATED).json({
      message: "User registered successfully",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
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
