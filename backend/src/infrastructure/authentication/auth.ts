import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/infrastructure/database/db";
export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql", transaction: true }),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:4000",
  trustedOrigins: [process.env.FRONTEND_ORIGIN ?? "http://localhost:3000"],
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 30,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  advanced: {
    ipAddress: { ipAddressHeaders: ["x-forwarded-for"] },
    defaultCookieAttributes: { httpOnly: true, sameSite: "lax" },
  },
});
