import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "admin",
  database: "job_matching_db",
});

export const db = drizzle(pool);

export const connectDB = async () => {
  try {
    await pool.connect();
    console.log("Database connected successfully");

    // Run migrations
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
};
