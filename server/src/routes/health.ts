import { Router } from "express";
import { loadConfig } from "../config.js";
import type { HealthResponse } from "../types/api.js";

export const healthRouter = Router();

/** GET /health — 서버 상태 확인. API_SPEC 5장. */
healthRouter.get("/health", (_req, res) => {
  const config = loadConfig();
  const body: HealthResponse = {
    ok: true,
    service: config.serviceName,
    version: config.serviceVersion,
  };
  res.status(200).json(body);
});
