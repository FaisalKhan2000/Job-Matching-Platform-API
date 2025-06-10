import express from "express";
import { authenticateJwt } from "../configs/passport";

import { verifyRole } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import {} from "../validations/user.schema";
import { ROLES } from "../constants/user";
import { companySchema } from "../validations/company.schema";
import {
  createCompanyController,
  getCompanyController,
  listCompaniesController,
} from "../controller/company.controller";

const router = express.Router();

// Public routes (P)
router.get(
  "/:companyId",
  authenticateJwt,
  verifyRole([ROLES.RECRUITER, ROLES.ADMIN]),
  getCompanyController
);
// GET /api/companies?search=tech&page=2&limit=5&founded_year=2020
router.get("/", listCompaniesController);

// Recruiter Routes (R)
router.post(
  "/",
  validateRequest(companySchema),
  authenticateJwt,
  verifyRole([ROLES.RECRUITER, ROLES.ADMIN]),
  createCompanyController
);

export default router;
