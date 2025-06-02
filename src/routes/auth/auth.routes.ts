import express from "express";
import { register, login } from "../../controller/auth/auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { registerSchema } from "../../validations/auth.schema";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", login);

export default router;
