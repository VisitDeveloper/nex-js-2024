import "lib/node-buffer-polyfill";
import jwt from "jsonwebtoken";

export type SessionUser = {
  userId: number;
  email: string;
  role: string;
  username?: string;
};

export function verifyAppJwt(token: string): SessionUser | null {
  const secret = process.env.JWT_SECRET || "";
  if (!secret) return null;
  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload & {
      userId?: number;
      email?: string;
      role?: string;
      username?: string;
    };
    if (decoded.userId == null || !decoded.email) return null;
    return {
      userId: Number(decoded.userId),
      email: String(decoded.email),
      role: String(decoded.role || "user"),
      username: decoded.username ? String(decoded.username) : undefined,
    };
  } catch {
    return null;
  }
}

export function sessionDisplayName(user: SessionUser): string {
  const u = user.username?.trim();
  if (u) return u;
  const email = user.email;
  const at = email.indexOf("@");
  return at > 0 ? email.slice(0, at) : email;
}
