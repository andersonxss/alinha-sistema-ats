import type { RequestHandler } from "express";

export function createSecurityMiddleware(
  frontendOrigin: string,
): RequestHandler {
  return (req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("X-Frame-Options", "DENY");
    // Responses can contain personal data, sessions or changing task status.
    res.setHeader("Cache-Control", "private, no-store");
    const origin = req.get("origin");
    // The API is not behind a trusted proxy by default; discard client-supplied forwarding data.
    if (req.socket.remoteAddress) {
      req.headers["x-forwarded-for"] = req.socket.remoteAddress;
    }
    if (origin === frontendOrigin) {
      res.setHeader("Access-Control-Allow-Origin", frontendOrigin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Expose-Headers", "Location");
      res.setHeader("Vary", "Origin");
    }
    if (req.method === "OPTIONS") {
      if (origin !== frontendOrigin) return res.sendStatus(403);
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PATCH,DELETE,OPTIONS",
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type,Authorization",
      );
      return res.sendStatus(204);
    }
    next();
  };
}
