import { eq } from "drizzle-orm";
import { db } from "../../db/db";
import { AppError } from "../../utils/appError";
import { BAD_REQUEST } from "../../constants/http";
import { usersTable } from "../../db/tables/user.table";
import { hashPassword } from "../../utils/password";
import { createToken, JwtPayload } from "../../utils/jwt";

type registerServiceType = {
  name: string;
  email: string;
  password: string;
};

export const registerService = async ({
  name,
  email,
  password,
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

  // store token in cookie

  // Return response without password
  const { password: _, ...userWithoutPassword } = user;

  return { userWithoutPassword, token };
};
