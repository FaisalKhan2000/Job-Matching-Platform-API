ALTER TABLE "users" RENAME COLUMN "name" TO "fname";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "lname" varchar(255) NOT NULL;