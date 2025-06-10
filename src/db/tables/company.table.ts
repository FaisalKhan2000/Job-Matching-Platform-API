// CREATE TABLE Companies (
//     company_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     name VARCHAR(255) NOT NULL,
//     website VARCHAR(255),
//     description TEXT,
//     logo_url VARCHAR(255),
//     banner_url VARCHAR(255),
//     founded_year SMALLINT,
//     company_size VARCHAR(50), -- e.g., "1-10 employees", "10000+ employees"
//     -- headquarters_location_id UUID, -- If you want a specific HQ location from Locations table
//     -- FOREIGN KEY (headquarters_location_id) REFERENCES Locations(location_id),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     is_verified BOOLEAN DEFAULT FALSE -- Admin can verify companies
// );

import {
  pgTable,
  uuid,
  varchar,
  text,
  smallint,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user.table";

export const companiesTable = pgTable("companies", {
  company_id: uuid("company_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  website: varchar("website", { length: 255 }),
  description: text("description"),
  logo_url: varchar("logo_url", { length: 255 }),
  banner_url: varchar("banner_url", { length: 255 }),
  founded_year: smallint("founded_year"),
  company_size: varchar("company_size", { length: 50 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  is_verified: boolean("is_verified").default(false),

  created_by: uuid("created_by")
    .references(() => usersTable.user_id, {
      onDelete: "cascade",
    })
    .notNull(),
});
