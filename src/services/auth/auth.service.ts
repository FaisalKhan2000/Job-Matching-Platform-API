import { eq } from "drizzle-orm";
import { db } from "../../db/db";
import { AppError } from "../../utils/appError";
import { BAD_REQUEST, NOT_FOUND } from "../../constants/http";
import { usersTable } from "../../db/tables/user.table";
import { comparePassword, hashPassword } from "../../utils/password";
import { createToken, JwtPayload } from "../../utils/jwt";
import { Response } from "express";
import { NODE_ENV } from "../../constants/env";
import { setJWTCookie } from "../../utils/cookie";
import { LoginInput } from "../../validations/auth.schema";

type registerServiceType = {
  name: string;
  email: string;
  password: string;
  res: Response;
};

export const registerService = async ({
  name,
  email,
  password,
  res,
}: registerServiceType) => {
  // check if user already exists
  const existingUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (existingUser && existingUser.length > 0) {
    throw new AppError(BAD_REQUEST, "Email already registered");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // create new user
  const [user] = await db
    .insert(usersTable)
    .values({ name, email, password: hashedPassword })
    .returning();

  // create JWT token
  const payload: JwtPayload = {
    userId: user.id.toString(),
    email: user.email,
    role: "user",
  };

  const token = createToken(payload);

  // set cookie
  setJWTCookie("token", res, token);

  // Return response without password
  const { password: _, ...userWithoutPassword } = user;

  return { userWithoutPassword, token };
};

type loginServiceType = {
  email: string;
  password: string;
  res: Response;
};

export const loginService = async ({
  email,
  password,
  res,
}: loginServiceType) => {
  // Look up user by email
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  // Unified error for security
  if (!user || !(await comparePassword(password, user.password))) {
    throw new AppError(BAD_REQUEST, "Invalid email or password");
  }

  // JWT payload
  const payload = {
    userId: user.id.toString(),
    email: user.email,
    role: user.role,
  };

  const token = createToken(payload);

  // Set secure HTTP-only cookie
  setJWTCookie("token", res, token);

  return { message: "login successfully" };
};
