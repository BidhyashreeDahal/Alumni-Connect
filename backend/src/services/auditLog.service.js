import { prisma } from "../db/prisma.js";

export async function recordAuditLog(req, {
  action,
  entityType,
  entityId = null,
  summary = null,
  metadata = null,
  actorId = undefined,
  actorRole = undefined
}) {
  if (!prisma.auditLog) {
    req?.log?.warn({ action, entityType }, "Audit log model not available");
    return null;
  }

  try {
    return await prisma.auditLog.create({
      data: {
        actorId: actorId ?? req?.user?.id ?? null,
        actorRole: actorRole ?? req?.user?.role ?? null,
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        summary,
        metadata,
        requestId: req?.id ?? null,
        ipAddress: req?.ip ?? null,
        userAgent: req?.get?.("user-agent") ?? null
      }
    });
  } catch (error) {
    req?.log?.warn(
      { err: error, action, entityType, entityId },
      "Failed to persist audit log"
    );
    return null;
  }
}
