ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE json USING role::json;
