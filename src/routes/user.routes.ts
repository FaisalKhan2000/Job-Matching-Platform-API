import express from "express";
import { authenticateJwt } from "../configs/passport";
import {
  currentUser,
  promoteToRecruiter,
  updateCurrentUser,
  updateCurrentUserPassword,
} from "../controller/user.controller";
import { verifyRole } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import {
  updateCurrentUserPasswordSchema,
  updateUserSchema,
} from "../validations/user.schema";
import { Role, ROLES } from "../constants/user";

const router = express.Router();

/**
 * Current User Routes
 * @protected
 * Endpoints for getting and updating the authenticated user's profile
 * Requires: JWT authentication and 'user' role
 */
router.get(
  "/me",
  authenticateJwt,
  verifyRole([ROLES.USER, ROLES.ADMIN, ROLES.RECRUITER]),
  currentUser
);
router.patch(
  "/me",
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
  "/me/password",
  validateRequest(updateCurrentUserPasswordSchema),
  authenticateJwt,
  verifyRole([ROLES.USER, ROLES.ADMIN, ROLES.RECRUITER]),
  updateCurrentUserPassword
);

router.patch(
  "/me/become-recruiter",
  authenticateJwt,
  verifyRole([ROLES.USER, ROLES.ADMIN, ROLES.RECRUITER]),
  promoteToRecruiter
);

export default router;
