import express from "express";
import { authenticateJwt } from "../../configs/passport";
import {
  login,
  logout,
  register,
  requestPasswordReset,
  resetPassword,
  sendEmailVerificationCode,
  verifyEmail,
} from "../../controller/auth/auth.controller";
import { verifyRole } from "../../middleware/authMiddleware";
import { validateRequest } from "../../middleware/validateRequest";
import { loginSchema, registerSchema } from "../../validations/auth.schema";
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
  updateCurrentUserPasswordSchema,
  updateUserSchema,
} from "../../validations/user.schema";
import { currentUser } from "../../controller/user/user.controller";
import { updateCurrentUser } from "../../controller/user/user.controller";
import { updateCurrentUserPassword } from "../../controller/user/user.controller";

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
router.get("/users/me", authenticateJwt, verifyRole(["user"]), currentUser);
router.patch(
  "/users/me",
  validateRequest(updateUserSchema),
  authenticateJwt,
  verifyRole(["user"]),
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
  verifyRole(["user"]),
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
  verifyRole(["user"]),
  requestPasswordReset
);

// Step 2: Confirm and set new password (POST with token param + body)
router.post(
  "/password-reset/confirm/:token",
  validateRequest(resetPasswordSchema),
  authenticateJwt,
  verifyRole(["user"]),
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
  verifyRole(["user"]),
  sendEmailVerificationCode
);

// Verify the token
router.post(
  "/verify-email/:token",
  authenticateJwt,
  verifyRole(["user"]),
  verifyEmail
);

export default router;
