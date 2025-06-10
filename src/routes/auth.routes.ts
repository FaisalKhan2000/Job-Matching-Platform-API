import express from "express";
import { authenticateJwt } from "../configs/passport";
import {
  login,
  logout,
  register,
  requestPasswordReset,
  resetPassword,
  sendEmailVerificationCode,
  verifyEmail,
} from "../controller/auth.controller";
import { verifyRole } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { loginSchema, registerSchema } from "../validations/auth.schema";
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
  updateCurrentUserPasswordSchema,
  updateUserSchema,
} from "../validations/user.schema";
import { currentUser } from "../controller/user.controller";
import { updateCurrentUser } from "../controller/user.controller";
import { updateCurrentUserPassword } from "../controller/user.controller";
import { ROLES } from "../constants/user";

const router = express.Router();

/**
 * Authentication Routes
 * @public
 * Register, login, and logout endpoints that don't require authentication
 */

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/logout", authenticateJwt, logout);

/**
 * Current User Routes
 * @protected
 * Endpoints for getting and updating the authenticated user's profile
 * Requires: JWT authentication and 'user' role
 */
router.get(
  "/users/me",
  authenticateJwt,
  verifyRole([ROLES.USER, ROLES.ADMIN, ROLES.RECRUITER]),
  currentUser
);
router.patch(
  "/users/me",
  validateRequest(updateUserSchema),
  authenticateJwt,
  verifyRole([ROLES.USER, ROLES.ADMIN, ROLES.RECRUITER]),
  updateCurrentUser
);

/**
 * Password Management Routes
 * @protected
 * Endpoints for updating password while logged in
 * Requires: JWT authentication and 'user' role
 */
router.patch(
  "/users/me/password",
  validateRequest(updateCurrentUserPasswordSchema),
  authenticateJwt,
  verifyRole([ROLES.USER, ROLES.ADMIN, ROLES.RECRUITER]),
  updateCurrentUserPassword
);

/**
 * Password Reset Flow
 * @protected
 * Two-step process for resetting forgotten passwords
 * Requires: JWT authentication and 'user' role
 */

// Step 1: Request password reset token
router.get(
  "/password-reset/request",
  authenticateJwt,
  verifyRole([ROLES.USER, ROLES.ADMIN, ROLES.RECRUITER]),
  requestPasswordReset
);

// Step 2: Confirm and set new password (POST with token param + body)
router.post(
  "/password-reset/confirm/:token",
  validateRequest(resetPasswordSchema),
  authenticateJwt,
  verifyRole([ROLES.USER, ROLES.ADMIN, ROLES.RECRUITER]),
  resetPassword
);

/**
 * Email Verification Flow
 * @protected
 * Endpoints for sending and verifying email verification codes
 * Requires: JWT authentication and 'user' role
 */

// Step 1: Send verification code
router.get(
  "/verify-email/send",
  authenticateJwt,
  verifyRole([ROLES.USER, ROLES.ADMIN, ROLES.RECRUITER]),
  sendEmailVerificationCode
);

// Verify the token
router.post(
  "/verify-email/:token",
  authenticateJwt,
  verifyRole([ROLES.USER, ROLES.ADMIN, ROLES.RECRUITER]),
  verifyEmail
);

export default router;
