export const ROLES = {
  USER: "user",
  ADMIN: "admin",
  RECRUITER: "recruiter",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
