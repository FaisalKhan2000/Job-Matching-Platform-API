import { Request, Response, NextFunction } from "express";
import { catchErrors } from "../utils/catchErrors";
import { AppError } from "../utils/appError";
import { FORBIDDEN, UNAUTHORIZED } from "../constants/http";
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "../types/types";

export const authenticateUser = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.signedCookies["token"];

    if (!token) throw new AppError(UNAUTHORIZED, "Token missing");

    const user = verifyToken(token);

    req.user = user;

    next();
  }
);

export const verifyRole =
  (allowedRoles: Array<string>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(UNAUTHORIZED, "Authentication required");
      }

      // Change this line - role is a string, not an object
      const role = req.user.role;

      if (!allowedRoles.includes(role)) {
        throw new AppError(
          FORBIDDEN,
          "You do not have permission to access this resource"
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
