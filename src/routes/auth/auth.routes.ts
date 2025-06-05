import express from "express";
import { register, login, logout } from "../../controller/auth/auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { loginSchema, registerSchema } from "../../validations/auth.schema";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/logout", logout);

export default router;
