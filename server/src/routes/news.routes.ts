import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { authenticateJWT, requireRole, AuthenticatedRequest } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { NewsCategory } from "@prisma/client";

const router = Router();

const createNewsSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  category: z.nativeEnum(NewsCategory).optional(),
  bannerMediaId: z.string().optional(),
  isPublished: z.boolean().optional(),
});

// GET /api/news (Public / Paginated)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category as NewsCategory | undefined;

    const whereClause: any = { isPublished: true };
    if (category) whereClause.category = category;

    const [news, total] = await Promise.all([
      prisma.newsAnnouncement.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: {
          banner: true,
          author: { select: { firstName: true, lastName: true, role: true } },
        },
      }),
      prisma.newsAnnouncement.count({ where: whereClause }),
    ]);

    return res.json({
      data: news,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch news" });
  }
});

// GET /api/news/:slug
router.get("/:slug", async (req, res) => {
  try {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const item = await prisma.newsAnnouncement.findUnique({
      where: { slug },
      include: {
        banner: true,
        author: { select: { firstName: true, lastName: true, role: true } },
      },
    });

    if (!item) {
      return res.status(404).json({ error: "Article not found" });
    }

    return res.json(item);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch article" });
  }
});

// POST /api/news (Admin Create)
router.post("/", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN"), validateBody(createNewsSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, category, bannerMediaId, isPublished } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();

    const newItem = await prisma.newsAnnouncement.create({
      data: {
        title,
        slug,
        content,
        category: category || "OFFICIAL_ANNOUNCEMENT",
        bannerMediaId,
        isPublished: isPublished !== undefined ? isPublished : true,
        createdById: req.user!.userId,
      },
      include: { banner: true },
    });

    return res.status(201).json(newItem);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create announcement" });
  }
});

// DELETE /api/news/:id (Admin Delete)
router.delete("/:id", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.newsAnnouncement.delete({ where: { id } });
    return res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete announcement" });
  }
});

export default router;
