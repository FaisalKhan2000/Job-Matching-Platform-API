import { eq } from "drizzle-orm";
import { logger } from "../configs/winston";
import { BAD_REQUEST } from "../constants/http";
import { db } from "../db/db";
import { usersTable } from "../db/tables/user.table";
import {
  promoteToRecruiterServiceType,
  updateCurrentUserPasswordServiceType,
} from "../types/types";
import { updateCurrentUserServiceType } from "../types/types";
import { currentUserServiceType } from "../types/types";
import { AppError } from "../utils/appError";
import { hashPassword } from "../utils/password";
import { comparePassword } from "../utils/password";
import { ROLES } from "../constants/user";

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

export const promoteToRecruiterService = async ({
  userId,
}: promoteToRecruiterServiceType) => {
  logger.info("Fetching user for updating role to recruiter", { userId });
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.user_id, userId));

  if (!user) {
    logger.error("User not found for password update", { userId });
    throw new AppError(BAD_REQUEST, "User not found");
  }

  // check if already recruiter
  if (user.role === ROLES.RECRUITER) {
    logger.error("Already a recruiter", { userId });
    throw new AppError(BAD_REQUEST, "Already a recruiter");
  }

  // update role
  const [updatedUser] = await db
    .update(usersTable)
    .set({ role: ROLES.RECRUITER })
    .where(eq(usersTable.user_id, userId))
    .returning();

  if (!updatedUser) {
    logger.error("Failed to update role in database", { userId });
    throw new AppError(BAD_REQUEST, "Failed to update role");
  }

  logger.info("Role updated in database successfully", { userId });

  const { password: _, ...safeUser } = updatedUser;
  return safeUser;
};
