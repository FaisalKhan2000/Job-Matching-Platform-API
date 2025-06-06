import express from "express";
import {
  register,
  login,
  logout,
  currentUser,
} from "../../controller/auth/auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { loginSchema, registerSchema } from "../../validations/auth.schema";
import { authenticateUser, verifyRole } from "../../middleware/authMiddleware";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/logout", logout);
router.get(
  "/users/me",
  authenticateUser,
  verifyRole(["user", "admin"]),
  currentUser
);

export default router;
