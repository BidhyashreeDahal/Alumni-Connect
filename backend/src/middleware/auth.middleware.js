import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const cookieName = process.env.COOKIE_NAME || "ac_auth";
  const token = req.cookies?.[cookieName];
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, email }
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}
