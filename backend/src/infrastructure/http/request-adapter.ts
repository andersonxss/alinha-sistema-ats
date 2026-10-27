import { Readable } from "node:stream";
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";
import type { WebHandler } from "@/domain/repositories/http-handler.contract";

export function adapt(handler: WebHandler, hasId = false) {
  return async (
    req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction,
  ) => {
    try {
      const headers = new Headers();
      for (const [name, value] of Object.entries(req.headers)) {
        if (Array.isArray(value))
          value.forEach((item) => {
            headers.append(name, item);
          });
        else if (value !== undefined) headers.set(name, value);
      }
      // Never trust a caller-supplied forwarding header when no proxy is configured.
      if (req.socket.remoteAddress) {
        headers.set("x-forwarded-for", req.socket.remoteAddress);
      }
      const method = req.method.toUpperCase();
      const request = new Request(
        new URL(req.originalUrl, `${req.protocol}://${req.get("host")}`),
        {
          method,
          headers,
          ...(method === "GET" || method === "HEAD"
            ? {}
            : { body: Readable.toWeb(req) as ReadableStream, duplex: "half" }),
        } as RequestInit & { duplex?: "half" },
      );
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const response = await handler(request, {
        params: Promise.resolve({ id: hasId ? (id ?? "") : "" }),
      });
      for (const [name, value] of response.headers) res.setHeader(name, value);
      const cookies = response.headers.getSetCookie();
      if (cookies.length) res.setHeader("set-cookie", cookies);
      res.status(response.status);
      if (method === "HEAD" || response.body === null) return res.end();
      res.send(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      next(error);
    }
  };
}
