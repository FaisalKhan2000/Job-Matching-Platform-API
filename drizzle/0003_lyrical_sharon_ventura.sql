ALTER TABLE "users" ADD COLUMN "email_verification_token" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verification_expires_at" timestamp;