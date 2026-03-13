import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma.js";

export async function requireAuth(req, res, next) {
  const cookieName = process.env.COOKIE_NAME || "ac_auth";
  const token = req.cookies?.[cookieName];
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}
