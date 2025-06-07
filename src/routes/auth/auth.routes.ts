import express from "express";
import {
  register,
  login,
  logout,
  currentUser,
  updateCurrentUser,
  updateCurrentUserPassword,
  sendEmailVerificationCode,
} from "../../controller/auth/auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { loginSchema, registerSchema } from "../../validations/auth.schema";
import { authenticateUser, verifyRole } from "../../middleware/authMiddleware";
import { authenticateJwt } from "../../configs/passport";
import {
  updateCurrentUserPasswordSchema,
  updateUserSchema,
} from "../../validations/user.schema";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/logout", logout);

router.get("/users/me", authenticateJwt, verifyRole(["user"]), currentUser);
router.patch(
  "/users/me",
  validateRequest(updateUserSchema),
  authenticateJwt,
  verifyRole(["user"]),
  updateCurrentUser
);
router.patch(
  "/users/me/password",
  validateRequest(updateCurrentUserPasswordSchema),
  authenticateJwt,
  verifyRole(["user"]),
  updateCurrentUserPassword
);

router.get(
  "/verify-email/send",
  authenticateJwt,
  verifyRole(["user"]),
  sendEmailVerificationCode
);

export default router;
