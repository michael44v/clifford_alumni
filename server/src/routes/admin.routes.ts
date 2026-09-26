import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { authenticateJWT, requireRole, AuthenticatedRequest } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

const router = Router();

const facultySchema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
});

const setSchema = z.object({
  setName: z.string().min(2),
  graduationYear: z.number().int(),
  description: z.string().optional(),
});

const leadershipSchema = z.object({
  name: z.string().min(2),
  position: z.string().min(2),
  biography: z.string(),
  photoMediaId: z.string().optional(),
  termStart: z.number().int(),
  termEnd: z.number().int().optional(),
  isCurrent: z.boolean().optional(),
  orderIndex: z.number().int().optional(),
});

// GET /api/admin/stats (Dashboard aggregate stats)
router.get("/stats", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "EXCO_ADMIN"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalMembers,
      verifiedMembers,
      pendingVerifications,
      pendingBusinessListings,
      totalEvents,
      activeWelfareCases,
      totalDuesCollected,
      totalDonationsCollected,
    ] = await Promise.all([
      prisma.member.count({ where: { deletedAt: null } }),
      prisma.member.count({ where: { verificationStatus: "VERIFIED", deletedAt: null } }),
      prisma.member.count({ where: { verificationStatus: "PENDING", deletedAt: null } }),
      prisma.businessListing.count({ where: { status: "PENDING" } }),
      prisma.event.count(),
      prisma.welfareRequest.count({ where: { status: { in: ["NEW", "PENDING", "IN_REVIEW"] } } }),
      prisma.paymentRecord.aggregate({
        where: { duesItemId: { not: null }, status: "SUCCESSFUL" },
        _sum: { amount: true },
      }),
      prisma.paymentRecord.aggregate({
        where: { donationCampaignId: { not: null }, status: "SUCCESSFUL" },
        _sum: { amount: true },
      }),
    ]);

    return res.json({
      totalMembers,
      verifiedMembers,
      pendingVerifications,
      pendingBusinessListings,
      totalEvents,
      activeWelfareCases,
      financials: {
        totalDuesCollected: totalDuesCollected._sum.amount || 0,
        totalDonationsCollected: totalDonationsCollected._sum.amount || 0,
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

// GET /api/admin/faculties (Reference management)
router.get("/faculties", async (req, res) => {
  try {
    const faculties = await prisma.faculty.findMany({ orderBy: { name: "asc" } });
    return res.json(faculties);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch faculties" });
  }
});

// POST /api/admin/faculties
router.post("/faculties", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN"), validateBody(facultySchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const faculty = await prisma.faculty.create({ data: req.body });
    return res.status(201).json(faculty);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create faculty" });
  }
});

// GET /api/admin/sets
router.get("/sets", async (req, res) => {
  try {
    const sets = await prisma.graduatingSet.findMany({ orderBy: { graduationYear: "asc" } });
    return res.json(sets);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch graduating sets" });
  }
});

// POST /api/admin/sets
router.post("/sets", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN"), validateBody(setSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const newSet = await prisma.graduatingSet.create({ data: req.body });
    return res.status(201).json(newSet);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create graduating set" });
  }
});

// GET /api/admin/leadership (Public EXCO Profiles)
router.get("/leadership", async (req, res) => {
  try {
    const leadership = await prisma.leadershipProfile.findMany({
      where: { isCurrent: true },
      orderBy: { orderIndex: "asc" },
      include: { photo: true },
    });
    return res.json(leadership);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch leadership profiles" });
  }
});

// POST /api/admin/leadership
router.post("/leadership", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN"), validateBody(leadershipSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const leader = await prisma.leadershipProfile.create({
      data: req.body,
      include: { photo: true },
    });
    return res.status(201).json(leader);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create leadership profile" });
  }
});

// GET /api/admin/members (View all alumni members)
router.get("/members", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "EXCO_ADMIN", "MODERATOR"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = (req.query.search as string) || "";
    const status = (req.query.status as string) || "";

    const whereClause: any = { deletedAt: null };
    if (status) {
      whereClause.verificationStatus = status;
    }
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { matricNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const members = await prisma.member.findMany({
      where: whereClause,
      include: {
        graduatingSet: true,
        faculty: true,
        location: true,
        profilePhoto: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const safeMembers = members.map(({ passwordHash, ...m }) => m);
    return res.json(safeMembers);
  } catch (err) {
    console.error("Admin fetch members error:", err);
    return res.status(500).json({ error: "Failed to fetch members" });
  }
});

// PUT /api/admin/members/:id (Modify member status, role, or details)
router.put("/members/:id", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "EXCO_ADMIN"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const memberId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { verificationStatus, role, firstName, lastName, email, phone, profession, company } = req.body;

    const updated = await prisma.member.update({
      where: { id: memberId },
      data: {
        ...(verificationStatus && { verificationStatus }),
        ...(role && { role }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(profession && { profession }),
        ...(company && { company }),
      },
      include: {
        graduatingSet: true,
        faculty: true,
      },
    });

    const { passwordHash, ...safeMember } = updated;
    return res.json(safeMember);
  } catch (err) {
    console.error("Admin update member error:", err);
    return res.status(500).json({ error: "Failed to update member" });
  }
});

// PUT /api/admin/members/:id/alumni-of-the-week (Set or unset Alumni of the Week)
router.put("/members/:id/alumni-of-the-week", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN", "EXCO_ADMIN"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const memberId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { isAlumniOfWeek, alumniOfWeekBio } = req.body;

    if (isAlumniOfWeek) {
      // Clear previous alumni of the week
      await prisma.member.updateMany({
        where: { isAlumniOfWeek: true },
        data: { isAlumniOfWeek: false },
      });
    }

    const updated = await prisma.member.update({
      where: { id: memberId },
      data: {
        isAlumniOfWeek: !!isAlumniOfWeek,
        alumniOfWeekBio: alumniOfWeekBio || null,
      },
      include: {
        graduatingSet: true,
        faculty: true,
        profilePhoto: true,
      },
    });

    const { passwordHash, ...safeMember } = updated;
    return res.json(safeMember);
  } catch (err) {
    console.error("Set Alumni of the Week error:", err);
    return res.status(500).json({ error: "Failed to update Alumni of the Week" });
  }
});

// GET /api/admin/payments (All payment records)
router.get("/payments", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payments = await prisma.paymentRecord.findMany({
      include: {
        member: { select: { firstName: true, lastName: true, email: true } },
        duesItem: { select: { title: true } },
        donationCampaign: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(payments);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// DELETE /api/admin/leadership/:id
router.delete("/leadership/:id", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.leadershipProfile.delete({ where: { id } });
    return res.json({ message: "Leadership profile removed" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete leadership profile" });
  }
});

export default router;
