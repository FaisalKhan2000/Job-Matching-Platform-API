// Set up environment variables before any imports
process.env.PORT = "3000";
process.env.NODE_ENV = "test";
process.env.BCRYPT_SALT_ROUNDS = "10";
process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "1h";
process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test_db";
process.env.COOKIE_SECRET = "test-cookie-secret";
