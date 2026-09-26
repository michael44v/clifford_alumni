import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "../utils/jwt.js";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (
      allowedRoles.includes(req.user.role) ||
      req.user.role === "SUPER_ADMIN" ||
      req.user.role === "ADMIN"
    ) {
      return next();
    }

    return res.status(403).json({ error: "Forbidden: insufficient privileges" });
  };
}

export function requireVerifiedAlumni(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Admins bypass verified alumni check
  if (req.user.role !== "MEMBER") {
    return next();
  }

  if (req.user.verificationStatus !== "VERIFIED") {
    return res.status(403).json({ error: "Access restricted to verified alumni members" });
  }

  next();
}
