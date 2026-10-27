import express, { type Router } from "express";
import { errorHandler, notFoundHandler } from "./middleware/errors";
import { createSecurityMiddleware } from "./middleware/security";

export function createApp(apiRouter: Router, frontendOrigin: string) {
  const app = express();
  app.disable("x-powered-by");
  app.use(createSecurityMiddleware(frontendOrigin));
  // Auth and Web Request handlers consume the raw stream; do not add a body parser here.
  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
