import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { authenticateJWT, requireVerifiedAlumni, AuthenticatedRequest } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

const router = Router();

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  profession: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  locationId: z.string().optional(),
  diasporaCountry: z.string().optional(),
  diasporaCity: z.string().optional(),
  profilePhotoMediaId: z.string().optional(),
  profilePhotoUrl: z.string().optional(),
  privacySettings: z.record(z.boolean()).optional(),
});

// GET /api/members/featured (Public - Featured Alumni for Landing Page)
router.get("/featured", async (req, res) => {
  try {
    let featured = await prisma.member.findMany({
      where: { isFeatured: true, verificationStatus: "VERIFIED", deletedAt: null },
      take: 4,
      include: { graduatingSet: true, faculty: true, location: true, profilePhoto: true },
      orderBy: { updatedAt: "desc" },
    });

    // If less than 4 featured, complement with recent verified alumni
    if (featured.length < 4) {
      const existingIds = featured.map(m => m.id);
      const remaining = 4 - featured.length;
      const recent = await prisma.member.findMany({
        where: { id: { notIn: existingIds }, verificationStatus: "VERIFIED", deletedAt: null, role: "MEMBER" },
        take: remaining,
        include: { graduatingSet: true, faculty: true, location: true, profilePhoto: true },
        orderBy: { createdAt: "desc" },
      });
      featured = [...featured, ...recent];
    }

    const safeMembers = featured.map(({ passwordHash, ...m }) => m);
    return res.json(safeMembers);
  } catch (err) {
    console.error("Fetch featured members error:", err);
    return res.status(500).json({ error: "Failed to fetch featured members" });
  }
});

// GET /api/members/alumni-of-the-week (Public)
router.get("/alumni-of-the-week", async (req, res) => {
  try {
    const member = await prisma.member.findFirst({
      where: { isAlumniOfWeek: true, deletedAt: null },
      include: {
        graduatingSet: true,
        faculty: true,
        location: true,
        profilePhoto: true,
      },
    });
    if (!member) {
      return res.json(null);
    }
    const { passwordHash, ...safeMember } = member;
    return res.json(safeMember);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch alumni of the week" });
  }
});

// GET /api/members/me
router.get("/me", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.user!.userId },
      include: {
        graduatingSet: true,
        faculty: true,
        location: true,
        profilePhoto: true,
      },
    });

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    const { passwordHash, ...safeMember } = member;
    return res.json(safeMember);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PUT /api/members/me
router.put("/me", authenticateJWT, validateBody(updateProfileSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { profilePhotoUrl, ...updateData } = req.body;

    if (profilePhotoUrl) {
      const media = await prisma.media.create({
        data: {
          cloudinaryPublicId: `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          secureUrl: profilePhotoUrl,
          folder: "avatars",
        },
      });
      updateData.profilePhotoMediaId = media.id;
    }

    const updatedMember = await prisma.member.update({
      where: { id: req.user!.userId },
      data: updateData,
      include: {
        graduatingSet: true,
        faculty: true,
        location: true,
        profilePhoto: true,
      },
    });

    const { passwordHash, ...safeMember } = updatedMember;
    return res.json(safeMember);
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// GET /api/members/directory (Searchable, paginated)
router.get("/directory", authenticateJWT, requireVerifiedAlumni, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || "";
    const setId = (req.query.setId as string) || "";
    const facultyId = (req.query.facultyId as string) || "";
    const locationState = (req.query.state as string) || "";

    const whereClause: any = {
      verificationStatus: "VERIFIED",
      deletedAt: null,
    };

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { profession: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }

    if (setId) whereClause.graduatingSetId = setId;
    if (facultyId) whereClause.facultyId = facultyId;
    if (locationState) {
      whereClause.location = { state: locationState };
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          memberType: true,
          profession: true,
          company: true,
          privacySettings: true,
          graduatingSet: true,
          faculty: true,
          location: true,
          profilePhoto: true,
        },
        orderBy: { lastName: "asc" },
      }),
      prisma.member.count({ where: whereClause }),
    ]);

    // Apply privacy controls filter per member setting
    const privacyFilteredMembers = members.map((m) => {
      const privacy = (m.privacySettings as Record<string, boolean>) || {};
      return {
        ...m,
        email: privacy.emailPublic ? m.email : null,
        phone: privacy.phonePublic ? m.phone : null,
      };
    });

    return res.json({
      data: privacyFilteredMembers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Directory error:", err);
    return res.status(500).json({ error: "Failed to fetch directory" });
  }
});

// GET /api/members/:id (Detailed view for verified alumni)
router.get("/:id", authenticateJWT, requireVerifiedAlumni, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const memberId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        graduatingSet: true,
        faculty: true,
        location: true,
        profilePhoto: true,
        businessListings: { where: { status: "APPROVED" } },
      },
    });

    if (!member) {
      return res.status(404).json({ error: "Member profile not found" });
    }

    const privacy = (member.privacySettings as Record<string, boolean>) || {};
    const { passwordHash, ...safeMember } = member;

    return res.json({
      ...safeMember,
      email: privacy.emailPublic ? safeMember.email : null,
      phone: privacy.phonePublic ? safeMember.phone : null,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch member detail" });
  }
});

export default router;
