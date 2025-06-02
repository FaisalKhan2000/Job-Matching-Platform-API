import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "./src/constants/env";

export default defineConfig({
  out: "./drizzle",
  schema: ["./src/db/tables/user.table.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
