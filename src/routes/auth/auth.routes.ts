import express from "express";
import { authenticateJwt } from "../../configs/passport";
import {
  currentUser,
  login,
  logout,
  register,
  sendEmailVerificationCode,
  updateCurrentUser,
  updateCurrentUserPassword,
} from "../../controller/auth/auth.controller";
import { verifyRole } from "../../middleware/authMiddleware";
import { validateRequest } from "../../middleware/validateRequest";
import { loginSchema, registerSchema } from "../../validations/auth.schema";
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
