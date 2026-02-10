import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const cookieName = process.env.COOKIE_NAME || "ac_auth";
  const token = req.cookies?.[cookieName];
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, role }
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
