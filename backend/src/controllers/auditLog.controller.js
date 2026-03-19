import { prisma } from "../db/prisma.js";

export async function listAuditLogs(req, res) {
  if (!prisma.auditLog) {
    return res.status(503).json({
      message: "Audit log model is not available yet. Apply Prisma schema changes, run migration, and regenerate Prisma client."
    });
  }

  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(req.query.pageSize) || 20, 1), 100);
    const skip = (page - 1) * pageSize;

    const action = req.query.action ? String(req.query.action).trim() : undefined;
    const entityType = req.query.entityType ? String(req.query.entityType).trim() : undefined;
    const actorId = req.query.actorId ? String(req.query.actorId).trim() : undefined;
    const search = req.query.search ? String(req.query.search).trim() : undefined;

    const where = {
      action: action || undefined,
      entityType: entityType || undefined,
      actorId: actorId || undefined,
      OR: search
        ? [
            { summary: { contains: search, mode: "insensitive" } },
            { action: { contains: search, mode: "insensitive" } },
            { entityType: { contains: search, mode: "insensitive" } },
            { entityId: { contains: search, mode: "insensitive" } },
            { actor: { is: { email: { contains: search, mode: "insensitive" } } } }
          ]
        : undefined
    };

    const [logs, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize
      }),
      prisma.auditLog.count({ where })
    ]);

    return res.json({
      logs,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize))
      }
    });
  } catch (error) {
    req.log?.error({ err: error }, "Failed to load audit logs");
    return res.status(500).json({ message: "Failed to load audit logs" });
  }
}
