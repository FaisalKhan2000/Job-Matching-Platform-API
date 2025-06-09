import { eq } from "drizzle-orm";
import { sendEmail } from "../../configs/mailtrap";
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
} from "../../constants/http";
import { db } from "../../db/db";
import { usersTable } from "../../db/tables/user.table";
import {
  currentUserServiceType,
  JwtPayload,
  loginServiceType,
  registerServiceType,
  requestPasswordResetInput,
  requestPasswordResetServiceType,
  resetPasswordServiceType,
  SendEmailVerificationServiceType,
  updateCurrentUserPasswordServiceType,
  updateCurrentUserServiceType,
  verifyEmailServiceType,
} from "../../types/types";
import { AppError } from "../../utils/appError";
import { setJWTCookie } from "../../utils/cookie";
import { generateSecureToken } from "../../utils/generateSecureToken";
import { createToken } from "../../utils/jwt";
import { comparePassword, hashPassword } from "../../utils/password";

import { NODE_ENV } from "../../constants/env";
import { logger } from "../../configs/winston";

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
    logger.error("Email already registered", { email });
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
    logger.error("Invalid email or password", { email });
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

  const { password: _, ...publicUser } = user;
  return { publicUser, message: "login successfully" };
};

export const currentUserService = async ({
  userId,
}: currentUserServiceType) => {
  logger.info("currentUserService called", { userId });
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.user_id, userId));

  if (!user) {
    logger.error("User not found in database", { userId });
    throw new AppError(BAD_REQUEST, "User not found");
  }

  logger.info("User found in database", { userId });

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
  logger.info("updateCurrentUserService called", { userId });

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.user_id, userId));

  if (!user) {
    logger.error("User not found in updateCurrentUserService", { userId });
    throw new AppError(BAD_REQUEST, "User not found");
  }

  const updateFields: Partial<typeof usersTable.$inferInsert> = {};

  if (email !== undefined && email !== user.email) {
    updateFields.email = email;
    updateFields.email_verified_at = null; // email needs re-verification
    logger.info("Email change detected, resetting email verification", {
      userId,
      newEmail: email,
    });
  }

  if (firstName !== undefined && firstName !== user.first_name) {
    updateFields.first_name = firstName;
  }

  if (lastName !== undefined && lastName !== user.last_name) {
    updateFields.last_name = lastName;
  }

  if (Object.keys(updateFields).length > 0) {
    logger.info("Updating user fields", { userId, updateFields });
    await db
      .update(usersTable)
      .set(updateFields)
      .where(eq(usersTable.user_id, userId));
  } else {
    logger.info("No changes detected, skipping update", { userId });
  }

  const [updatedUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.user_id, userId));

  if (!updatedUser) {
    logger.error("Failed to fetch updated user after update", { userId });
    throw new AppError(BAD_REQUEST, "Failed to fetch updated user");
  }

  const { password, ...safeUser } = updatedUser;

  logger.info("Returning updated user data", { userId });

  return safeUser;
};

export const updateCurrentUserPasswordService = async ({
  userId,
  password,
}: updateCurrentUserPasswordServiceType) => {
  logger.info("Fetching user for password update", { userId });
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.user_id, userId));

  if (!user) {
    logger.error("User not found for password update", { userId });
    throw new AppError(BAD_REQUEST, "User not found");
  }

  // check if password is same as previous password
  const isSamePassword = await comparePassword(password, user.password);

  if (isSamePassword) {
    logger.warn("Attempt to update password with the same current password", {
      userId,
    });
    throw new AppError(
      400,
      "New password must be different from the current password"
    );
  }

  const hashedPassword = await hashPassword(password);
  logger.info("Password hashed successfully", { userId });

  // update password
  const [updatedUser] = await db
    .update(usersTable)
    .set({ password: hashedPassword })
    .where(eq(usersTable.user_id, userId))
    .returning();

  if (!updatedUser) {
    logger.error("Failed to update password in database", { userId });
    throw new AppError(BAD_REQUEST, "Failed to update password");
  }

  logger.info("Password updated in database successfully", { userId });

  const { password: _, ...safeUser } = updatedUser;
  return safeUser;
};

export const SendEmailVerificationService = async ({
  userId,
}: SendEmailVerificationServiceType) => {
  // Find user email first
  const [user] = await db
    .select({
      email: usersTable.email,
      email_verified_at: usersTable.email_verified_at,
    })
    .from(usersTable)
    .where(eq(usersTable.user_id, userId));

  if (!user) {
    logger.warn("User not found when sending verification email", { userId });
    throw new AppError(NOT_FOUND, "User not found");
  }

  if (user.email_verified_at) {
    logger.warn("Email already verified", { userId });
    throw new AppError(BAD_REQUEST, "Email already verified");
  }

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

    logger.info("Verification email sent", { userId, email: user.email });

    return {
      message: "Verification email sent successfully",
    };
  } catch (error: any) {
    logger.error("Failed to send verification email", {
      userId,
      error: error?.message || error,
    });

    // Rollback token
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

export const verifyEmailService = async ({
  userId,
  token,
}: verifyEmailServiceType) => {
  const [user] = await db
    .select({
      email: usersTable.email,
      email_verified: usersTable.email_verified,
      email_verified_at: usersTable.email_verified_at,
      email_verification_token: usersTable.email_verification_token,
      email_verification_expires_at: usersTable.email_verification_expires_at,
    })
    .from(usersTable)
    .where(eq(usersTable.user_id, userId));

  if (!user) {
    logger.warn("User not found during email verification", { userId });
    throw new AppError(NOT_FOUND, "User not found");
  }

  if (user.email_verified) {
    logger.info("Email already verified", { userId });
    throw new AppError(BAD_REQUEST, "Email already verified");
  }

  if (
    !user.email_verification_token ||
    user.email_verification_token !== token
  ) {
    logger.warn("Invalid email verification token", { userId });
    throw new AppError(UNAUTHORIZED, "Invalid verification token");
  }

  const now = new Date();
  if (
    !user.email_verification_expires_at ||
    user.email_verification_expires_at < now
  ) {
    logger.warn("Verification token expired", { userId });
    throw new AppError(UNAUTHORIZED, "Verification token has expired");
  }

  // Update: verify email + clear token fields
  await db
    .update(usersTable)
    .set({
      email_verified: true,
      email_verified_at: now,
      email_verification_token: null,
      email_verification_expires_at: null,
    })
    .where(eq(usersTable.user_id, userId));

  logger.info("Email verified successfully", { userId });

  return { message: "Email successfully verified" };
};

export const requestPasswordResetService = async ({
  userId,
}: requestPasswordResetServiceType) => {
  logger.info("Looking up user for password reset", { userId });
  // find user email first
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.user_id, userId));

  if (!user) {
    logger.warn("User not found for password reset", { userId });
    throw new AppError(NOT_FOUND, "User not found");
  }

  if (!user.email_verified) {
    logger.warn("Password reset requested for unverified email", { userId });
    throw new AppError(BAD_REQUEST, "Email not verified");
  }

  const { token, expiresIn } = generateSecureToken();
  logger.info("Generated password reset token", {
    userId,
    tokenExpiresAt: expiresIn,
  });

  await db
    .update(usersTable)
    .set({
      password_reset_token: token,
      password_reset_expires_at: expiresIn,
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
      text: `Your password reset code is: ${token}`,
      category: "Email Verification",
      sandbox: NODE_ENV !== "production",
    });
    logger.info("Password reset email sent successfully", {
      userId,
      email: user.email,
    });

    return {
      message: "Verification email sent successfully",
    };
  } catch (error) {
    logger.error("Failed to send password reset email", { userId, error });
    // Rollback token if email fails
    await db.update(usersTable).set({
      password_reset_token: null,
      password_reset_expires_at: null,
    });

    throw new AppError(
      INTERNAL_SERVER_ERROR,
      "Failed to send verification email"
    );
  }
};

export const resetPasswordService = async ({
  userId,
  password,
  token,
}: resetPasswordServiceType) => {
  logger.info("Fetching user for password reset", { userId });

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.user_id, userId));

  if (!user) {
    logger.warn("User not found for password reset", { userId });
    throw new AppError(NOT_FOUND, "User not found");
  }

  if (!user.email_verified_at) {
    logger.warn("Password reset requested for unverified email", { userId });
    throw new AppError(BAD_REQUEST, "Email not verified");
  }

  if (user.password_reset_token !== token) {
    logger.warn("Invalid password reset token", { userId, token });
    throw new AppError(UNAUTHORIZED, "Invalid verification token");
  }

  const now = new Date();
  if (user.password_reset_expires_at && user.password_reset_expires_at < now) {
    logger.warn("Password reset token expired", {
      userId,
      expiresAt: user.password_reset_expires_at,
    });
    throw new AppError(UNAUTHORIZED, "Verification token has expired");
  }

  const isSamePassword = await comparePassword(password, user.password);

  if (isSamePassword) {
    logger.warn("New password matches old password", { userId });
    throw new AppError(
      400,
      "New password must be different from the current password"
    );
  }

  const hashedPassword = await hashPassword(password);

  await db
    .update(usersTable)
    .set({
      password: hashedPassword,
      password_reset_token: null,
      password_reset_expires_at: null,
    })
    .where(eq(usersTable.user_id, userId));

  logger.info("Password updated and reset token cleared", { userId });

  return { message: "Password Reset Successful" };
};
