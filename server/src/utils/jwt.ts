import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "clifford-alumni-access-secret-key-2025";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "clifford-alumni-refresh-secret-key-2025";

export interface TokenPayload {
  userId: string;
  role: string;
  memberType: string;
  verificationStatus: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(payload: TokenPayload): { token: string; hash: string } {
  const token = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hash };
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
