import { companiesTable } from "../db/tables/company.table";
import { db } from "../db/db";
import {
  createCompanyServiceType,
  getCompanyServiceType,
  listCompaniesInput,
} from "../types/types";
import { and, eq, ilike, count, or, sql } from "drizzle-orm";
import { AppError } from "../utils/appError";
import { BAD_REQUEST, FORBIDDEN } from "../constants/http";
import { usersTable } from "../db/tables/user.table";

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

export const listCompaniesService = async ({
  search,
  page = 1,
  limit = 10,
  founded_year,
  company_size,
}: listCompaniesInput) => {
  const pageNum = Math.max(page, 1);
  const limitNum = Math.min(Math.max(limit, 1), 100); //  max 100 per page
  // To calculate the starting point (how many rows to skip) for the current page.
  // Page 1: (1 - 1) * 10 = 0 → Skip 0 rows
  // Page 2: (2 - 1) * 10 = 10 → Skip 10 rows
  // Page 3: (3 - 1) * 10 = 20 → Skip 20 rows
  const offset = (pageNum - 1) * limitNum;

  // dynamic filters
  const filters = [];

  // search
  if (search) {
    const likeSearch = `%${search.toLowerCase()}%`;

    filters.push(
      or(
        ilike(companiesTable.name, likeSearch),
        ilike(companiesTable.description, likeSearch),
        ilike(companiesTable.website, likeSearch)
      )
    );
  }

  // filters
  if (founded_year) {
    filters.push(eq(companiesTable.founded_year, parseInt(founded_year)));
  }
  if (company_size) {
    filters.push(eq(companiesTable.company_size, company_size));
  }

  // Query total count for pagination
  const [{ count: total }] = await db
    .select({ count: count() })
    .from(companiesTable)
    .where(filters.length ? and(...filters) : undefined);

  // Fetch paginated data
  const companies = await db
    .select()
    .from(companiesTable)
    .where(filters.length ? and(...filters) : undefined)
    .limit(limitNum)
    .offset(offset);

  return {
    companies,
    pagination: {
      total: Number(total),
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(Number(total) / limitNum),
    },
  };
};

export const getRecruiterCompanyService = async ({
  userId,
}: {
  userId: string;
}) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.user_id, userId));

  if (!user) {
    throw new AppError(BAD_REQUEST, "User not found");
  }

  const [company] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.created_by, user.user_id));

  if (!company) {
    throw new AppError(BAD_REQUEST, "Recruiter hasn't created a company");
  }

  return company;
};
