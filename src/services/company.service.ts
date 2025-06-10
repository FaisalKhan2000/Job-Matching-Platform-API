import { companiesTable } from "../db/tables/company.table";
import { db } from "../db/db";
import {
  createCompanyServiceType,
  getCompanyServiceType,
  listCompaniesInput,
} from "../types/types";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { AppError } from "../utils/appError";
import { BAD_REQUEST } from "../constants/http";
import { count } from "console";

export const createCompanyService = async ({
  userId,
  company,
}: createCompanyServiceType) => {
  const [existingCompany] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.created_by, userId));

  if (existingCompany) {
    throw new AppError(
      BAD_REQUEST,
      "User already created a company. Delete the existing company to add a new one."
    );
  }

  const [newCompany] = await db
    .insert(companiesTable)
    .values({
      name: company.name,
      website: company.website,
      description: company.description,
      logo_url: company.logo_url,
      banner_url: company.banner_url,
      founded_year: company.founded_year,
      company_size: company.company_size,
      created_by: userId, // 🔥 required foreign key
    })
    .returning();

  return newCompany;
};

export const getCompanyService = async ({
  companyId,
}: getCompanyServiceType) => {
  const [company] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.company_id, companyId));

  if (!company) {
    throw new AppError(BAD_REQUEST, "no companies found");
  }

  return company;
};
