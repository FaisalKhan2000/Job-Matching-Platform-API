import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/*
CREATE TABLE "Users" (
  "user_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "email" varchar(255) UNIQUE NOT NULL,
  "password_hash" varchar(255) NOT NULL,
  "first_name" varchar(100),
  "last_name" varchar(100),
  "role" varchar(20) NOT NULL,
  "is_active" boolean DEFAULT true,
  "email_verified_at" timestamp,
  "last_login_at" timestamp,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

*/
export const usersTable = pgTable("users", {
  user_id: uuid().primaryKey().defaultRandom(), // UUID with gen_random_uuid()
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  first_name: varchar({ length: 100 }), // nullable
  last_name: varchar({ length: 100 }), // nullable
  role: varchar({ length: 20 }).notNull().default("user"),
  is_active: boolean().default(true),
  email_verified: boolean().default(false),
  email_verification_token: varchar({ length: 64 }),
  email_verification_expires_at: timestamp(),
  email_verified_at: timestamp(),
  password_reset_token: varchar({ length: 64 }),
  password_reset_expires_at: timestamp(),
  last_login_at: timestamp(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
});

export const users = usersTable;

// Prepare queries
// export const userQueries = {
//   findFirst: async (userId: string) => ({
//     user_id: true,
//     email: true,
//     email_verified: true,
//   }),
// };
