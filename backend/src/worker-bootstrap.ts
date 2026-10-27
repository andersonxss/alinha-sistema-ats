import { resolve } from "node:path";
import dotenv from "dotenv";

dotenv.config({
  path: process.env.ENV_FILE ?? resolve(process.cwd(), "../.env"),
});
await import("./worker/index");
