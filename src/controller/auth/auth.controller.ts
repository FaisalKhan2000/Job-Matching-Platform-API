import { NextFunction, Request, Response } from "express";
import { catchErrors } from "../../utils/catchErrors";
import {
  currentUserService,
  loginService,
  registerService,
  requestPasswordResetService,
  resetPasswordService,
  SendEmailVerificationService,
  updateCurrentUserPasswordService,
  updateCurrentUserService,
  verifyEmailService,
} from "../../services/auth/auth.service";
import { BAD_REQUEST, CREATED, NOT_FOUND, OK } from "../../constants/http";
import { resetJWTCookie } from "../../utils/cookie";
import {
  LoginInput,
  RegisterInput,
  requestPasswordResetInput,
  resetPasswordInput,
  updateUserInput,
  updateUserPasswordInput,
} from "../../types/types";
import { AppError } from "../../utils/appError";
import { db } from "../../db/db";
import { usersTable } from "../../db/tables/user.table";
import { eq } from "drizzle-orm";

export const register = catchErrors(
  async (
    req: Request<{}, {}, RegisterInput>,
    res: Response,
    next: NextFunction
  ) => {
    const { firstName, lastName, email, password } = req.body;

    const { publicUser, token } = await registerService({
      firstName,
      lastName,
      email,
      password,
      res,
    });

    return res.status(CREATED).json({
      message: "User registered successfully",
      data: {
        user: publicUser,
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
    const userId = req.user?.userId!;

    // find in database
    const user = await currentUserService({ userId, res });

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

    if (!firstName && !lastName && !email) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Please provide at least one field to update",
      });
    }

    const updatedUser = await updateCurrentUserService({
      userId,
      firstName,
      lastName,
      email,
    });

    res.status(OK).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
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

    const updatedUser = await updateCurrentUserPasswordService({
      userId,
      password,
    });

    res.status(OK).json({
      success: true,
      message: "Password updated successfully",
      data: {
        user: updatedUser,
      },
    });
  }
);

export const requestPasswordReset = catchErrors(
  async (
    req: Request<{}, {}, requestPasswordResetInput>,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.user?.userId!;

    const { message } = await requestPasswordResetService({ userId });

    res.status(OK).json({ success: true, message });
  }
);

export const resetPassword = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId!;
    const token = req.params.token;
    const { password } = req.body;

    if (!token) {
      throw new AppError(BAD_REQUEST, "Reset token is required");
    }

    const { message } = await resetPasswordService({
      userId,
      password,
      token,
    });

    res.status(OK).json({ success: true, message });
  }
);

export const sendEmailVerificationCode = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId!;

    const { message } = await SendEmailVerificationService({ userId });

    return res.status(OK).json({
      success: true,
      message,
    });
  }
);

export const verifyEmail = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId!;
    const token = req.params.token as string;

    if (!token) {
      throw new AppError(BAD_REQUEST, "Verification token is required");
    }

    const { message } = await verifyEmailService({ userId, token });

    res.status(OK).json({ success: true, message });
  }
);
