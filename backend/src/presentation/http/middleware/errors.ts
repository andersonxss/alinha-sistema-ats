import type { ErrorRequestHandler, RequestHandler } from "express";
import { errorResponse } from "@/presentation/http/error-response";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res
    .status(404)
    .json({ error: "Rota não encontrada.", code: "ROUTE_NOT_FOUND" });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const response = errorResponse(error);
  res.status(response.status).json(response.body);
};
