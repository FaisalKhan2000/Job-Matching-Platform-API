const DB_USER = "postgres";
const DB_PASS = "admin";
const DB_HOST = "127.0.0.1";
const DB_PORT = 5432;

import { drizzle } from "drizzle-orm/node-postgres";
import { DATABASE_URL } from "../constants/env";

// You can specify any property from the node-postgres connection options
export const db = drizzle({
  connection: {
    connectionString: DATABASE_URL,
    ssl: true,
  },
});
