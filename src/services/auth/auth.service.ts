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
}: SendEmailVerificationServiceType) => {
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

export const verifyEmailService = async ({
  userId,
  token,
}: verifyEmailServiceType) => {
  // Find user email first
  const [user] = await db
    .select({
      email: usersTable.email,
      email_verified: usersTable.email_verified,
      email_verification_token: usersTable.email_verification_token,
      email_verification_expires_at: usersTable.email_verification_expires_at,
    })
    .from(usersTable)
    .where(eq(usersTable.user_id, userId));

  if (!user) {
    throw new AppError(NOT_FOUND, "User not found");
  }

  if (user.email_verified) {
    throw new AppError(BAD_REQUEST, "Email already verified");
  }

  // Check if token matches
  if (user.email_verification_token !== token) {
    throw new AppError(UNAUTHORIZED, "Invalid verification token");
  }

  // Check if token has expired
  const now = new Date();
  if (
    user.email_verification_expires_at &&
    user.email_verification_expires_at < now
  ) {
    throw new AppError(UNAUTHORIZED, "Verification token has expired");
  }

  //  Update the user: mark email as verified and clear token
  await db
    .update(usersTable)
    .set({
      email_verified: true,
      email_verification_token: null,
      email_verification_expires_at: null,
    })
    .where(eq(usersTable.user_id, userId))
    .execute();

  return { message: "Email successfully verified" };
};

export const requestPasswordResetService = async ({
  userId,
}: requestPasswordResetServiceType) => {
  // find user email first
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.user_id, userId));

  if (!user) {
    throw new AppError(NOT_FOUND, "User not found");
  }

  if (!user.email_verified) {
    throw new AppError(BAD_REQUEST, "Email not verified");
  }

  const { token, expiresIn } = generateSecureToken();

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

    return {
      message: "Verification email sent successfully",
    };
  } catch (error) {
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
  // find user first
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.user_id, userId));

  if (!user) {
    throw new AppError(NOT_FOUND, "User not found");
  }

  if (!user.email_verified) {
    throw new AppError(BAD_REQUEST, "Email not verified");
  }

  if (user.password_reset_token !== token) {
    throw new AppError(UNAUTHORIZED, "Invalid verification token");
  }
  const now = new Date();
  if (user.password_reset_expires_at && user.password_reset_expires_at < now) {
    throw new AppError(UNAUTHORIZED, "Verification token has expired");
  }

  const isSamePassword = await comparePassword(password, user.password);

  if (isSamePassword)
    throw new AppError(
      400,
      "New password must be different from the current password"
    );

  const hashedPassword = await hashPassword(password);

  await db
    .update(usersTable)
    .set({
      password: hashedPassword,
      password_reset_token: null,
      password_reset_expires_at: null,
    })
    .where(eq(usersTable.user_id, userId));

  return { message: "Password Reset Successful" };
};
