import { composeApiRouter } from "./composition/api";
import { createApp } from "./presentation/http/create-app";

export const app = createApp(
  composeApiRouter(),
  process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
);
