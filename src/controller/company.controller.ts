import { Request, Response, NextFunction } from "express";
import { catchErrors } from "../utils/catchErrors";
import {
  createCompanyService,
  getCompanyService,
  getRecruiterCompanyService,
  listCompaniesService,
} from "../services/company.service";
import { BAD_REQUEST, CREATED, OK } from "../constants/http";
import { createCompanyInput, listCompaniesInput } from "../types/types";
import { AppError } from "../utils/appError";
import { db } from "../db/db";
import { companiesTable } from "../db/tables/company.table";
import { and, count, eq, ilike, or } from "drizzle-orm";

// Create a new company
export const createCompanyController = catchErrors(
  async (
    req: Request<{}, {}, createCompanyInput>,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.user?.userId!;
    const companyInput = req.body;

    const company = await createCompanyService({
      userId,
      company: companyInput,
    });

    res.status(CREATED).json({
      success: true,
      message: "Company created successfully",
      data: { company },
    });
  }
);

// Get a single company by ID or slug
export const getCompanyController = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const companyId = req.params.companyId;

    if (!companyId) {
      throw new AppError(BAD_REQUEST, "Company ID is required");
    }

    const company = await getCompanyService({ companyId });

    return res.status(OK).json({
      success: true,
      message: "Company found successfully",
      data: { company },
    });
  }
);

export const listCompaniesController = catchErrors(
  async (
    req: Request<{}, {}, {}, listCompaniesInput>,
    res: Response,
    next: NextFunction
  ) => {
    const {
      search,
      page = 1,
      limit = 10,
      founded_year,
      company_size,
    } = req.query;

    const data = await listCompaniesService({
      search,
      page,
      limit,
      founded_year,
      company_size,
    });

    res.status(200).json({
      success: true,
      message: "Companies fetched successfully",
      data: data.companies,
      pagination: data.pagination,
    });
  }
);

// Search or list companies
// export const listCompaniesController = catchErrors(
//   async (req: Request, res: Response, next: NextFunction) => {
//     // search
//     // filter
//     // pagination

//     const {
//       search,
//       page = "1",
//       limit = "10",
//       founded_year,
//       company_size,
//     }: queryType = req.query;

//     const pageNum = Math.max(parseInt(page, 10), 1);
//     const limitNum = Math.min(Math.max(parseInt(limit, 10), 1), 100); // max 100 per page
//     // To calculate the starting point (how many rows to skip) for the current page.
//     // Page 1: (1 - 1) * 10 = 0 → Skip 0 rows
//     // Page 2: (2 - 1) * 10 = 10 → Skip 10 rows
//     // Page 3: (3 - 1) * 10 = 20 → Skip 20 rows
//     const offset = (pageNum - 1) * limitNum;

//     // dynamic filters
//     const filters = [];

//     // search
//     if (search) {
//       const likeSearch = `%${search.toLowerCase()}%`;

//       filters.push(
//         or(
//           ilike(companiesTable.name, likeSearch),
//           ilike(companiesTable.description, likeSearch),
//           ilike(companiesTable.website, likeSearch)
//         )
//       );
//     }

//     // filters
//     if (founded_year) {
//       filters.push(eq(companiesTable.founded_year, parseInt(founded_year)));
//     }
//     if (company_size) {
//       filters.push(eq(companiesTable.company_size, company_size));
//     }

//     // Query total count for pagination
//     const [{ count: total }] = await db
//       .select({ count: count() })
//       .from(companiesTable)
//       .where(filters.length ? and(...filters) : undefined);

//     // Fetch paginated data
//     const companies = await db
//       .select()
//       .from(companiesTable)
//       .where(filters.length ? and(...filters) : undefined)
//       .limit(limitNum)
//       .offset(offset);

//     res.json({
//       success: true,
//       total: Number(total),
//       page: pageNum,
//       limit: limitNum,
//       data: companies,
//       totalPages: Math.ceil(Number(total) / limitNum),
//     });
//   }
// );

// Get company associated with a recruiter
export const getRecruiterCompanyController = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(BAD_REQUEST, "User ID is required");
    }

    const company = await getRecruiterCompanyService({ userId });

    return res.status(OK).json({
      success: true,
      message: "Company fetched successfully",
      data: company,
    });
  }
);

// Update an existing company
export const updateCompanyController = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {}
);

// Verify a company (admin or system action)
export const verifyCompanyController = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {}
);

// Search companies assigned to recruiters
export const listRecruiterCompaniesController = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {}
);
