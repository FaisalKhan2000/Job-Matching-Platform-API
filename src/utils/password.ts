import bcrypt from "bcrypt";
import { AppError } from "./appError";
import { BAD_REQUEST } from "../constants/http";

const DEFAULT_SALT_ROUNDS = 10;

/**
 * Hashes a password using bcrypt
 * @param password - The password to hash
 * @returns The hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const saltRounds =
      parseInt(process.env.SALT_ROUNDS || "") || DEFAULT_SALT_ROUNDS;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new AppError(
      BAD_REQUEST,
      `Hashing password failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Compares a password with a hashed password
 * @param password - The password to compare
 * @param hashedPassword - The hashed password to compare against
 * @returns True if passwords match
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new AppError(
      BAD_REQUEST,
      `Password comparison failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
