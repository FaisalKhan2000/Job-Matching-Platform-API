import { Request, Response, NextFunction } from "express";
import { logger } from "../configs/winston";
import { BAD_REQUEST } from "../constants/http";
import { OK } from "../constants/http";
import {
  promoteToRecruiterService,
  updateCurrentUserPasswordService,
} from "../services/user.service";
import { updateCurrentUserService } from "../services/user.service";
import { currentUserService } from "../services/user.service";
import { updateUserPasswordInput } from "../types/types";
import { updateUserInput } from "../types/types";
import { catchErrors } from "../utils/catchErrors";

export const currentUser = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId!;

    logger.info("currentUser called", { userId });

    // find in database
    const user = await currentUserService({ userId, res });

    logger.info("currentUser fetched user", { userId, userIdFound: !!user });

    res.status(OK).json(user);
  }
);

export const updateCurrentUser = catchErrors(
  async (
    req: Request<{}, {}, updateUserInput>,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.user?.userId!;
    const { firstName, lastName, email } = req.body;

    logger.info("updateCurrentUser called", {
      userId,
      firstName,
      lastName,
      email,
    });

    if (!firstName && !lastName && !email) {
      logger.warn("No fields provided to update", { userId });
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Please provide at least one field to update",
      });
    }

    const safeUser = await updateCurrentUserService({
      userId,
      firstName,
      lastName,
      email,
    });

    logger.info("User profile updated successfully", { userId });

    res.status(OK).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: safeUser,
      },
    });
  }
);

export const updateCurrentUserPassword = catchErrors(
  async (
    req: Request<{}, {}, updateUserPasswordInput>,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.user?.userId!;
    const { password } = req.body;

    logger.info("Password update requested", { userId });

    const updatedUser = await updateCurrentUserPasswordService({
      userId,
      password,
    });

    logger.info("Password updated successfully", { userId });

    res.status(OK).json({
      success: true,
      message: "Password updated successfully",
      data: {
        user: updatedUser,
      },
    });
  }
);

export const promoteToRecruiter = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId!;

    logger.info("role update requested", { userId });

    const updatedUser = await promoteToRecruiterService({
      userId,
    });

    logger.info("role updated successfully", { userId });

    res.status(OK).json({
      success: true,
      message: "role updated successfully",
      data: {
        user: updatedUser,
      },
    });
  }
);
