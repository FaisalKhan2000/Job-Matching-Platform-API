import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { AppError } from "./appError";
import { BAD_REQUEST, UNAUTHORIZED } from "../constants/http";
import { JWT_EXPIRES_IN } from "../constants/env";
import { JWT_SECRET } from "../constants/env";

type Payload = {
  userId: string;
  role: string;
  email: string;
};

const SECRET = JWT_SECRET as Secret;
const OPTIONS = { expiresIn: JWT_EXPIRES_IN } as SignOptions;

/**
 * Creates a JWT token with the given payload
 * @param payload - User data to encode in token
 * @returns Signed JWT token
 */
export const createToken = (payload: Payload): string => {
  try {
    return jwt.sign(payload, SECRET, OPTIONS);
  } catch (error) {
    throw new AppError(
      BAD_REQUEST,
      `Token creation failed: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
  }
};

/**
 * Verifies and decodes a JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload
 */
export const verifyToken = (token: string): Payload => {
  try {
    const decoded = jwt.verify(token, SECRET) as Payload;
    return decoded;
  } catch (error) {
    throw new AppError(
      UNAUTHORIZED,
      `Token verification failed: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
  }
};
