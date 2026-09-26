import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { authenticateJWT, requireRole, AuthenticatedRequest } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { deleteCloudinaryAsset } from "../utils/cloudinary.js";

const router = Router();

const createListingSchema = z.object({
  businessName: z.string().min(2),
  category: z.string().min(2),
  industry: z.string().min(2),
  description: z.string().min(10),
  services: z.string().min(5),
  address: z.string().optional(),
  stateCity: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  logoMediaId: z.string().optional(),
  bannerMediaId: z.string().optional(),
});

// GET /api/business (Public / Approved listings only)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    const whereClause: any = { status: "APPROVED" };
    if (category && category !== "All Categories") whereClause.category = category;
    if (search) {
      whereClause.OR = [
        { businessName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { services: { contains: search, mode: "insensitive" } },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.businessListing.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          logo: true,
          banner: true,
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              graduatingSet: true,
              faculty: true,
            },
          },
        },
      }),
      prisma.businessListing.count({ where: whereClause }),
    ]);

    return res.json({
      data: listings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch business directory" });
  }
});

// POST /api/business (Member submit listing -> PENDING)
router.post("/", authenticateJWT, validateBody(createListingSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const listing = await prisma.businessListing.create({
      data: {
        ...req.body,
        memberId: req.user!.userId,
        status: "PENDING",
      },
      include: { logo: true, banner: true },
    });

    return res.status(201).json({
      message: "Business listing submitted for admin review and approval.",
      listing,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to submit business listing" });
  }
});

// GET /api/business/admin/pending (Admin review pending)
router.get("/admin/pending", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "MODERATOR"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pendingListings = await prisma.businessListing.findMany({
      where: { status: "PENDING" },
      include: {
        logo: true,
        banner: true,
        member: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return res.json(pendingListings);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch pending listings" });
  }
});

// PUT /api/business/admin/:id/moderate (Approve/Reject)
router.put("/admin/:id/moderate", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "MODERATOR"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, rejectionReason } = req.body; // status: APPROVED or REJECTED
    const listingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Status must be APPROVED or REJECTED" });
    }

    const listing = await prisma.businessListing.findUnique({
      where: { id: listingId },
      include: { logo: true, banner: true },
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // If rejected, clean up Cloudinary assets if needed
    if (status === "REJECTED" && listing.logo) {
      await deleteCloudinaryAsset(listing.logo.cloudinaryPublicId);
    }

    const updated = await prisma.businessListing.update({
      where: { id: listingId },
      data: { status, rejectionReason },
    });

    return res.json({ message: `Listing ${status.toLowerCase()} successfully`, listing: updated });
  } catch (err) {
    return res.status(500).json({ error: "Moderation action failed" });
  }
});

export default router;
