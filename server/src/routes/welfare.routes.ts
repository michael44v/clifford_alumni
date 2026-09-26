import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { authenticateJWT, requireRole, AuthenticatedRequest } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { WelfareCategory, WelfareUrgency, WelfareStatus } from "@prisma/client";

const router = Router();

const createWelfareRequestSchema = z.object({
  category: z.nativeEnum(WelfareCategory),
  urgency: z.nativeEnum(WelfareUrgency).optional(),
  description: z.string().min(10),
});

// POST /api/welfare (Confidential member submission)
router.post("/", authenticateJWT, validateBody(createWelfareRequestSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const welfareRequest = await prisma.welfareRequest.create({
      data: {
        memberId: req.user!.userId,
        category: req.body.category,
        urgency: req.body.urgency || "MEDIUM",
        description: req.body.description,
        status: "NEW",
      },
    });

    return res.status(201).json({
      message: "Welfare assistance request submitted confidentially. Our welfare team will reach out.",
      welfareRequest,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to submit welfare request" });
  }
});

// GET /api/welfare/my-requests (Member's own requests)
router.get("/my-requests", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requests = await prisma.welfareRequest.findMany({
      where: { memberId: req.user!.userId },
      orderBy: { createdAt: "desc" },
    });
    return res.json(requests);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch welfare requests" });
  }
});

// GET /api/welfare/admin/cases (Restricted to Welfare Admin / Super Admin)
router.get("/admin/cases", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "WELFARE_ADMIN"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cases = await prisma.welfareRequest.findMany({
      include: {
        member: { select: { firstName: true, lastName: true, email: true, phone: true } },
        assignedOfficer: { select: { firstName: true, lastName: true } },
      },
      orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
    });
    return res.json(cases);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch welfare cases" });
  }
});

// PUT /api/welfare/admin/cases/:id (Update case status/notes)
router.put("/admin/cases/:id", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "WELFARE_ADMIN"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, internalNotes, assignedOfficerId } = req.body;
    const caseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await prisma.welfareRequest.update({
      where: { id: caseId },
      data: {
        ...(status && { status }),
        ...(internalNotes !== undefined && { internalNotes }),
        ...(assignedOfficerId && { assignedOfficerId }),
      },
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update welfare case" });
  }
});

export default router;
