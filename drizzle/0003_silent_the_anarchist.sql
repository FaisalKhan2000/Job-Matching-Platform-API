ALTER TABLE "users" ADD COLUMN "name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "fname";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "lname";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "gender";