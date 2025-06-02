const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;

  if (value === undefined) {
    throw Error(`Missing String environment variable for ${key}`);
  }

  return value;
};

export const PORT = getEnv("PORT");
export const NODE_ENV = getEnv("NODE_ENV");
export const BCRYPT_SALT_ROUNDS = getEnv("BCRYPT_SALT_ROUNDS");
export const JWT_SECRET = getEnv("JWT_SECRET");
export const JWT_EXPIRES_IN = getEnv("JWT_EXPIRES_IN");
export const DATABASE_URL = getEnv("DATABASE_URL");
