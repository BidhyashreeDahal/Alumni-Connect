import { prisma } from "../db/prisma.js";
import { env } from "../config/env.js";

export function getHealth(_req, res) {
  return res.json({
    status: "ok",
    service: "alumni-connect-api",
    env: env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}

export async function getReadiness(req, res) {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.json({
      status: "ready",
      database: "ok",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    req.log?.error({ err: error }, "Readiness check failed");
    return res.status(503).json({
      status: "not_ready",
      database: "error"
    });
  }
}
