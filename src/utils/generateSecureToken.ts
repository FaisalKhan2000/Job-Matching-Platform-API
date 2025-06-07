import { randomBytes } from "crypto";

type typeSecureTokenReturn = {
  token: string;
  expiresIn: Date;
};

export const generateSecureToken = (): typeSecureTokenReturn => {
  const token = randomBytes(32).toString("hex");
  const expiresIn = new Date(Date.now() + 1000 * 60 * 60); // expires in 1 hour

  return { token, expiresIn };
};
