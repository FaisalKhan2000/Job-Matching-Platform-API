CREATE TABLE "companies" (
	"company_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"website" varchar(255),
	"description" text,
	"logo_url" varchar(255),
	"banner_url" varchar(255),
	"founded_year" smallint,
	"company_size" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_verified" boolean DEFAULT false
);
