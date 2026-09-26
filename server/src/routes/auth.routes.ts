import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "../utils/jwt.js";
import { generateUploadSignature } from "../utils/cloudinary.js";
import { validateBody } from "../middleware/validate.js";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";

const router = Router();

const alumniRegisterSchema = z.object({
  matricNumber: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

const associateRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  profession: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/verify-matric
router.post("/verify-matric", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { matricNumber } = req.body;
    if (!matricNumber) {
      return res.status(400).json({ error: "Matriculation number is required." });
    }
    const officialEntry = await prisma.officialAlumniDirectory.findUnique({
      where: { matricNumber: String(matricNumber).trim().toUpperCase() },
      include: { graduatingSet: true, faculty: true },
    });
    if (!officialEntry) {
      return res.status(404).json({
        valid: false,
        error: "Matriculation number not found in the official alumni directory. Please check your matric number or apply for Associate Membership.",
      });
    }
    return res.json({ valid: true, entry: officialEntry });
  } catch (err) {
    return res.status(500).json({ error: "Failed to verify matriculation number." });
  }
});

// POST /api/auth/register/alumni
router.post(
  "/register/alumni",
  authLimiter,
  validateBody(alumniRegisterSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { matricNumber, email, password, firstName, lastName, phone } = req.body;

      // 1. Check Official Directory
      const officialEntry = await prisma.officialAlumniDirectory.findUnique({
        where: { matricNumber },
      });

      if (!officialEntry) {
        return res.status(400).json({
          error:
            "Matriculation number not found in the official alumni directory. Please verify your matric number or apply for Associate Membership.",
        });
      }

      // 2. Check duplicate registration
      const existingMember = await prisma.member.findFirst({
        where: {
          OR: [{ email }, { matricNumber }],
        },
      });

      if (existingMember) {
        return res.status(400).json({
          error: "An account with this email or matriculation number already exists.",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newMember = await prisma.member.create({
        data: {
          email,
          passwordHash,
          matricNumber,
          firstName: firstName || officialEntry.firstName,
          lastName: lastName || officialEntry.lastName,
          phone,
          graduatingSetId: officialEntry.graduatingSetId,
          facultyId: officialEntry.facultyId,
          department: officialEntry.department,
          memberType: "ALUMNI",
          verificationStatus: "VERIFIED", // Pre-verified from official directory
        },
      });

      // Mark official directory record as registered
      await prisma.officialAlumniDirectory.update({
        where: { id: officialEntry.id },
        data: { isRegistered: true },
      });

      const tokenPayload = {
        userId: newMember.id,
        role: newMember.role,
        memberType: newMember.memberType,
        verificationStatus: newMember.verificationStatus,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const { token: refreshToken, hash: refreshHash } = generateRefreshToken(tokenPayload);

      await prisma.refreshToken.create({
        data: {
          memberId: newMember.id,
          hashedToken: refreshHash,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        message: "Registration successful",
        accessToken,
        member: {
          id: newMember.id,
          email: newMember.email,
          firstName: newMember.firstName,
          lastName: newMember.lastName,
          role: newMember.role,
          memberType: newMember.memberType,
          verificationStatus: newMember.verificationStatus,
        },
      });
    } catch (err) {
      console.error("Alumni registration error:", err);
      return res.status(500).json({ error: "Registration failed. Please try again." });
    }
  }
);

// POST /api/auth/register/associate
router.post(
  "/register/associate",
  authLimiter,
  validateBody(associateRegisterSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { email, password, firstName, lastName, phone, profession } = req.body;

      const existingMember = await prisma.member.findUnique({ where: { email } });
      if (existingMember) {
        return res.status(400).json({ error: "An account with this email already exists." });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newMember = await prisma.member.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          phone,
          profession,
          memberType: "ASSOCIATE",
          verificationStatus: "PENDING", // Associate members require admin approval
        },
      });

      const tokenPayload = {
        userId: newMember.id,
        role: newMember.role,
        memberType: newMember.memberType,
        verificationStatus: newMember.verificationStatus,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const { token: refreshToken, hash: refreshHash } = generateRefreshToken(tokenPayload);

      await prisma.refreshToken.create({
        data: {
          memberId: newMember.id,
          hashedToken: refreshHash,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        message: "Associate registration submitted. Account is pending administrator review.",
        accessToken,
        member: {
          id: newMember.id,
          email: newMember.email,
          firstName: newMember.firstName,
          lastName: newMember.lastName,
          role: newMember.role,
          memberType: newMember.memberType,
          verificationStatus: newMember.verificationStatus,
        },
      });
    } catch (err) {
      console.error("Associate registration error:", err);
      return res.status(500).json({ error: "Registration failed." });
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  authLimiter,
  validateBody(loginSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { email, password } = req.body;

      const member = await prisma.member.findUnique({
        where: { email },
      });

      if (!member) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const passwordValid = await bcrypt.compare(password, member.passwordHash);
      if (!passwordValid) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      if (member.verificationStatus === "SUSPENDED" || member.verificationStatus === "INACTIVE") {
        return res.status(403).json({ error: "Your account is currently inactive or suspended." });
      }

      const tokenPayload = {
        userId: member.id,
        role: member.role,
        memberType: member.memberType,
        verificationStatus: member.verificationStatus,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const { token: refreshToken, hash: refreshHash } = generateRefreshToken(tokenPayload);

      await prisma.refreshToken.create({
        data: {
          memberId: member.id,
          hashedToken: refreshHash,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        accessToken,
        member: {
          id: member.id,
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
          role: member.role,
          memberType: member.memberType,
          verificationStatus: member.verificationStatus,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Login failed" });
    }
  }
);

// POST /api/auth/refresh
router.post("/refresh", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawRefreshToken = req.cookies.refreshToken;
    if (!rawRefreshToken) {
      return res.status(401).json({ error: "Refresh token missing" });
    }

    const payload = verifyRefreshToken(rawRefreshToken);
    const tokenHash = hashToken(rawRefreshToken);

    const savedToken = await prisma.refreshToken.findUnique({
      where: { hashedToken: tokenHash },
      include: { member: true },
    });

    if (!savedToken || savedToken.isRevoked || new Date() > savedToken.expiresAt) {
      res.clearCookie("refreshToken");
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    // Revoke current refresh token (Rotation)
    await prisma.refreshToken.update({
      where: { id: savedToken.id },
      data: { isRevoked: true },
    });

    const newPayload = {
      userId: savedToken.member.id,
      role: savedToken.member.role,
      memberType: savedToken.member.memberType,
      verificationStatus: savedToken.member.verificationStatus,
    };

    const newAccessToken = generateAccessToken(newPayload);
    const { token: newRefreshToken, hash: newRefreshHash } = generateRefreshToken(newPayload);

    await prisma.refreshToken.create({
      data: {
        memberId: savedToken.member.id,
        hashedToken: newRefreshHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.clearCookie("refreshToken");
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawRefreshToken = req.cookies.refreshToken;
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await prisma.refreshToken.updateMany({
        where: { hashedToken: tokenHash },
        data: { isRevoked: true },
      });
    }
    res.clearCookie("refreshToken");
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.clearCookie("refreshToken");
    return res.json({ message: "Logged out" });
  }
});

// GET /api/auth/cloudinary-signature
router.get("/cloudinary-signature", authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const folder = (req.query.folder as string) || "alumni/uploads";
  const params = generateUploadSignature(folder);
  return res.json(params);
});

export default router;
