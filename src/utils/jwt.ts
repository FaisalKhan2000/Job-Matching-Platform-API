import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { AppError } from "./appError";
import { BAD_REQUEST, UNAUTHORIZED } from "../constants/http";
import { JWT_EXPIRES_IN } from "../constants/env";
import { JWT_SECRET } from "../constants/env";

export type JwtPayload = {
  userId: string;
  role: string;
  email: string;
};

const getSecret = () => JWT_SECRET as Secret;
const getOptions = () => ({ expiresIn: JWT_EXPIRES_IN } as SignOptions);

const validatePayload = (payload: JwtPayload) => {
  if (!payload.userId || !payload.role || !payload.email) {
    throw new AppError(BAD_REQUEST, "Invalid payload: missing required fields");
  }

  if (Object.values(payload).some((val) => val === null || val === undefined)) {
    throw new AppError(
      BAD_REQUEST,
      "Invalid payload: null or undefined values not allowed"
    );
  }
};

/**
 * Creates a JWT token with the given payload
 * @param payload - User data to encode in token
 * @returns Signed JWT token
 */
export const createToken = (payload: JwtPayload): string => {
  try {
    validatePayload(payload);
    return jwt.sign(payload, getSecret(), {
      ...getOptions(),
      // Let jwt.sign handle the iat (issued at) timestamp
      // It will automatically add different timestamps for each token
    });
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
export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, getSecret()) as JwtPayload & {
      iat?: number;
    };
    const { iat, ...payload } = decoded;
    validatePayload(payload);
    return payload;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      UNAUTHORIZED,
      `Token verification failed: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
  }
};
