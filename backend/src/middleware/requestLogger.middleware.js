import { randomUUID } from "crypto";
import pinoHttp from "pino-http";
import { logger } from "../config/logger.js";

export const requestLogger = pinoHttp({
  logger,
  genReqId(req, res) {
    const existingId = req.headers["x-request-id"];
    const requestId =
      typeof existingId === "string" && existingId.trim()
        ? existingId.trim()
        : randomUUID();

    res.setHeader("x-request-id", requestId);
    return requestId;
  },
  customProps(req) {
    return {
      userId: req.user?.id || null,
      role: req.user?.role || null
    };
  },
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode
      };
    }
  }
});
