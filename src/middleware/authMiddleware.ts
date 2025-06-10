import { NextFunction, Request, Response } from "express";
import { FORBIDDEN, UNAUTHORIZED } from "../constants/http";
import { AppError } from "../utils/appError";
import { catchErrors } from "../utils/catchErrors";
import { verifyToken } from "../utils/jwt";
import { Role } from "../constants/user";
import { logger } from "../configs/winston";

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
  (allowedRoles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(UNAUTHORIZED, "Authentication required");
      }

      const userRole = req.user.role as Role;

      // Log the role check for debugging
      logger.debug("Role verification", {
        userRole,
        allowedRoles,
        hasAccess: allowedRoles.includes(userRole),
      });

      if (!allowedRoles.includes(userRole)) {
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
