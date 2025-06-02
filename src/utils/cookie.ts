import { Response } from "express";
import { NODE_ENV } from "../constants/env";

export const setJWTCookie = (name: string, res: Response, token: string) => {
  const expiresIn = 24 * 60 * 60 * 1000; // 24 hours
  res.cookie(name, token, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "strict",
    signed: true,
    domain: NODE_ENV === "production" ? ".yourdomain.com" : "localhost",
    expires: new Date(Date.now() + expiresIn),
    maxAge: expiresIn,
    path: "/",
  });
};

export const resetJWTCookie = (name: string, res: Response) => {
  res.clearCookie(name, {
    path: "/",
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "lax",
  });
};
