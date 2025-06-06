import { Request, Response, NextFunction } from "express";
import { catchErrors } from "../../utils/catchErrors";

import {
  loginService,
  registerService,
} from "../../services/auth/auth.service";
import { CREATED, OK } from "../../constants/http";
import { resetJWTCookie } from "../../utils/cookie";
import { RegisterInput, LoginInput } from "../../types/types";

export const register = catchErrors(
  async (
    req: Request<{}, {}, RegisterInput>,
    res: Response,
    next: NextFunction
  ) => {
    const { firstName, lastName, email, password } = req.body;

    const { userWithoutPassword, token } = await registerService({
      firstName,
      lastName,
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
    req: Request<{}, {}, LoginInput>,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password } = req.body;

    const { message } = await loginService({ email, password, res });

    res.status(OK).json({ message });
  }
);

export const logout = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    // reset cookie
    resetJWTCookie("token", res);

    res.status(OK).json({ message: "logout successful" });
  }
);

export const currentUser = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.user;

    res.status(OK).json({ data });
  }
);
