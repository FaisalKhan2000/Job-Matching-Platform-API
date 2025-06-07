import { eq } from "drizzle-orm";
import { db } from "../../db/db";
import { AppError } from "../../utils/appError";
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
} from "../../constants/http";
import { usersTable } from "../../db/tables/user.table";
import { comparePassword, hashPassword } from "../../utils/password";
import { createToken } from "../../utils/jwt";
import { Response } from "express";
import { setJWTCookie } from "../../utils/cookie";
import {
  currentUserServiceType,
  JwtPayload,
  loginServiceType,
  registerServiceType,
  updateCurrentUserPasswordServiceType,
  updateCurrentUserServiceType,
} from "../../types/types";
import { generateSecureToken } from "../../utils/generateSecureToken";
import { sendEmail } from "../../configs/mailtrap";

import { NODE_ENV } from "../../constants/env";

export const registerService = async ({
  firstName,
  lastName,
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
    .values({
      first_name: firstName,
      last_name: lastName,
      email,
      password: hashedPassword,
      role: "user", // Set default role
    })
    .returning();

  // create JWT token
  const payload: JwtPayload = {
    userId: user.user_id,
    email: user.email,
    role: "user",
  };

  const token = createToken(payload);

  // set cookie
  setJWTCookie("token", res, token);

  // Return response without password
  const { password: _, ...publicUser } = user;

  return { publicUser, token };
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
    userId: user.user_id,
    email: user.email,
    role: user.role,
  };

  const token = createToken(payload);

  // Set secure HTTP-only cookie
  setJWTCookie("token", res, token);

  return { message: "login successfully" };
};

export const currentUserService = async ({
  userId,
}: currentUserServiceType) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.user_id, userId));

  if (!user) {
    throw new AppError(BAD_REQUEST, "User not found");
  }

  const { password, email_verified_at, ...rest } = user;

  return {
    ...rest,
    email_verified: !!email_verified_at,
  };
};

export const updateCurrentUserService = async ({
  userId,
  firstName,
  lastName,
  email,
}: updateCurrentUserServiceType) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.user_id, userId));

  if (!user) {
    throw new AppError(BAD_REQUEST, "User not found");
  }

  const updateFields: Partial<typeof usersTable.$inferInsert> = {};

  if (email !== undefined && email !== user.email) {
    updateFields.email = email;
    updateFields.email_verified_at = null; // Assuming email needs to be re-verified
  }

  if (firstName !== undefined && firstName !== user.first_name) {
    updateFields.first_name = firstName;
  }

  if (lastName !== undefined && lastName !== user.last_name) {
    updateFields.last_name = lastName;
  }

  if (Object.keys(updateFields).length > 0) {
    await db
      .update(usersTable)
      .set(updateFields)
      .where(eq(usersTable.user_id, userId));
  }

  const [updatedUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.user_id, userId));

  if (!updatedUser) {
    throw new AppError(BAD_REQUEST, "Failed to fetch updated user");
  }

  const { password, ...safeUser } = updatedUser;
  return safeUser;
};

export const updateCurrentUserPasswordService = async ({
  userId,
  password,
}: updateCurrentUserPasswordServiceType) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.user_id, userId));

  if (!user) {
    throw new AppError(BAD_REQUEST, "User not found");
  }

  // check if password is same as previous password
  const isSamePassword = await comparePassword(password, user.password);

  if (isSamePassword)
    throw new AppError(
      400,
      "New password must be different from the current password"
    );

  const hashedPassword = await hashPassword(password);

  // update password
  const [updatedUser] = await db
    .update(usersTable)
    .set({ password: hashedPassword })
    .where(eq(usersTable.user_id, userId))
    .returning();

  const { password: _, ...safeUser } = updatedUser;
  return safeUser;
};

export const SendEmailVerificationService = async ({
  userId,
}: {
  userId: string;
}) => {
  // Find user email first
  const [user] = await db
    .select({
      email: usersTable.email,
      email_verified: usersTable.email_verified,
    })
    .from(usersTable)
    .where(eq(usersTable.user_id, userId));

  if (!user) {
    throw new AppError(NOT_FOUND, "User not found");
  }

  if (user.email_verified) {
    throw new AppError(BAD_REQUEST, "Email already verified");
  }

  // Generate secure token
  const { token, expiresIn } = generateSecureToken();

  // Save token to db
  await db
    .update(usersTable)
    .set({
      email_verification_token: token,
      email_verification_expires_at: expiresIn,
    })
    .where(eq(usersTable.user_id, userId));

  // Send verification email
  try {
    await sendEmail({
      from: {
        address: "hello@demomailtrap.com",
        name: "Mailtrap Test",
      },
      to: [user.email],
      subject: "Verify Your Email",
      text: `Your verification code is: ${token}`,
      html: `
              <h1>Email Verification</h1>
              <p>Your verification code is: <strong>${token}</strong></p>
              <p>This code will expire in 1 hour.</p>
            `,
      category: "Email Verification",
      sandbox: NODE_ENV !== "production",
    });

    return {
      message: "Verification email sent successfully",
    };
  } catch (error) {
    // Rollback token if email fails
    await db
      .update(usersTable)
      .set({
        email_verification_token: null,
        email_verification_expires_at: null,
      })
      .where(eq(usersTable.user_id, userId));

    throw new AppError(
      INTERNAL_SERVER_ERROR,
      "Failed to send verification email"
    );
  }
};
