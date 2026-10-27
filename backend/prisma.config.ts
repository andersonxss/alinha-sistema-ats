import { resolve } from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({
  path: process.env.ENV_FILE ?? resolve(process.cwd(), "../.env"),
});
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://ats:ats@localhost:5432/ats",
  },
});
