import passport, { PassportStatic } from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../constants/env";
import { JwtPayload } from "../types/types";
import { AppError } from "../utils/appError";
import { UNAUTHORIZED } from "../constants/http";

// Custom extractor for signed cookies
const cookieExtractor = (req: Request): string | null => {
  if (req && req.signedCookies) {
    return req.signedCookies["token"];
  }
  return null;
};

export const configurePassport = (passport: PassportStatic) => {
  const opts = {
    jwtFromRequest: ExtractJwt.fromExtractors([
      // ExtractJwt.fromAuthHeaderAsBearerToken(),
      cookieExtractor,
    ]),
    secretOrKey: JWT_SECRET,
  };

  passport.use(
    "jwt",
    new JwtStrategy(opts, (jwt_payload: JwtPayload, done) => {
      try {
        // Validate required fields in payload
        if (!jwt_payload.userId || !jwt_payload.role || !jwt_payload.email) {
          return done(
            new AppError(UNAUTHORIZED, "Invalid token payload"),
            false
          );
        }

        // Success case
        return done(null, jwt_payload);
      } catch (error) {
        // Handle specific error cases
        if (error instanceof AppError) {
          return done(error, false);
        }
        return done(
          new AppError(UNAUTHORIZED, "Token verification failed"),
          false
        );
      }
    })
  );
};

// When Passport.js successfully authenticates a request:
// 1. It calls done(null, jwt_payload) in the strategy
// 2. Automatically attaches jwt_payload to req.user
// 3. Passes control to the next middleware
export const authenticateJwt = passport.authenticate("jwt", {
  session: false,
});
