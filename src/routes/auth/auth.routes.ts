import { Router } from "express";
import { register } from "../../controller/auth/auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { registerSchema } from "../../schemas/auth.schema";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);

export default router;
