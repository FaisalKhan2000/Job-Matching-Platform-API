CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'recruiter');--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "role" TO "user_role";