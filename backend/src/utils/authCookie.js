export function setAuthCookie(res, token) {
  const cookieName = process.env.COOKIE_NAME || "ac_auth";
  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 30 * 60 * 1000, // 30 minutes
  });
}

export function clearAuthCookie(res) {
  const cookieName = process.env.COOKIE_NAME || "ac_auth";
  res.clearCookie(cookieName);
}
