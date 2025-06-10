import { NextFunction, Request, Response } from "express";
import { BAD_REQUEST, CREATED, OK } from "../constants/http";
import {
  loginService,
  registerService,
  requestPasswordResetService,
  resetPasswordService,
  SendEmailVerificationService,
  verifyEmailService,
} from "../services/auth.service";
import {
  LoginInput,
  RegisterInput,
  requestPasswordResetInput,
  updateUserInput,
  updateUserPasswordInput,
} from "../types/types";
import { AppError } from "../utils/appError";
import { catchErrors } from "../utils/catchErrors";
import { resetJWTCookie } from "../utils/cookie";
import { logger } from "../configs/winston";

export const register = catchErrors(
  async (
    req: Request<{}, {}, RegisterInput>,
    res: Response,
    next: NextFunction
  ) => {
    const { firstName, lastName, email, password } = req.body;

    logger.info("Registration attempt", { email });

    const { publicUser, token } = await registerService({
      firstName,
      lastName,
      email,
      password,
      res,
    });

    logger.info("User registered successfully", {
      userId: publicUser.user_id,
      email: publicUser.email,
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
    logger.info("Login attempt", { email });

    const { message, publicUser } = await loginService({
      email,
      password,
      res,
    });

    logger.info("User LoggedIn successfully", {
      userId: publicUser.user_id,
      email: publicUser.email,
    });

    res.status(OK).json({ message });
  }
);

export const logout = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId!;

    logger.info("logout attempt", { userId });

    // reset cookie
    resetJWTCookie("token", res);

    logger.info("User LoggedOut successfully", { userId });

    res.status(OK).json({ message: "logout successful" });
  }
);

export const requestPasswordReset = catchErrors(
  async (
    req: Request<{}, {}, requestPasswordResetInput>,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.user?.userId!;
    logger.info("Password reset requested", { userId });

    const { message } = await requestPasswordResetService({ userId });

    logger.info("Password reset request sent successfully", { userId });
    res.status(OK).json({ success: true, message });
  }
);

export const resetPassword = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token;
    if (!token) {
      throw new AppError(BAD_REQUEST, "Reset token is required");
    }

    const userId = req.user?.userId!;
    logger.info("Password reset attempt", { userId, token });

    const { message } = await resetPasswordService({
      userId,
      password: req.body.password,
      token,
    });

    logger.info("Password reset successful", { userId });

    res.status(OK).json({ success: true, message });
  }
);

export const sendEmailVerificationCode = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId!;
    logger.info("Sending email verification code", { userId });

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
