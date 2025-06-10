import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required").max(255).trim(),
  website: z.string().url("Invalid website URL").max(255).optional(),
  description: z.string().optional(),
  logo_url: z.string().url("Invalid logo URL").max(255).optional(),
  banner_url: z.string().url("Invalid banner URL").max(255).optional(),
  founded_year: z
    .number()
    .int()
    .min(1000, "Year must be realistic")
    .max(new Date().getFullYear(), "Cannot be a future year")
    .optional(),
  company_size: z.string().max(50).optional(),
});
