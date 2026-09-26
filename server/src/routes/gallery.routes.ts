import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { authenticateJWT, requireRole, AuthenticatedRequest } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { GalleryCategory } from "@prisma/client";

const router = Router();

const createAlbumSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.nativeEnum(GalleryCategory).optional(),
  graduatingSetId: z.string().optional(),
  year: z.number().optional(),
});

const uploadPhotoSchema = z.object({
  albumId: z.string().uuid(),
  mediaId: z.string().uuid(),
  caption: z.string().optional(),
});

// GET /api/gallery/albums (Public / Paginated)
router.get("/albums", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const category = req.query.category as GalleryCategory | undefined;
    const setId = req.query.setId as string | undefined;

    const whereClause: any = {};
    if (category) whereClause.category = category;
    if (setId) whereClause.graduatingSetId = setId;

    const [albums, total] = await Promise.all([
      prisma.galleryAlbum.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          graduatingSet: true,
          photos: {
            take: 1, // Preview thumbnail
            include: { media: true },
          },
          _count: { select: { photos: true } },
        },
      }),
      prisma.galleryAlbum.count({ where: whereClause }),
    ]);

    return res.json({
      data: albums,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch gallery albums" });
  }
});

// GET /api/gallery/albums/:id
router.get("/albums/:id", async (req, res) => {
  try {
    const albumId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const album = await prisma.galleryAlbum.findUnique({
      where: { id: albumId },
      include: {
        graduatingSet: true,
        photos: {
          include: { media: true, uploadedBy: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }

    return res.json(album);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch album details" });
  }
});

// POST /api/gallery/albums (Admin Create)
router.post("/albums", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN"), validateBody(createAlbumSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const album = await prisma.galleryAlbum.create({
      data: req.body,
      include: { graduatingSet: true },
    });
    return res.status(201).json(album);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create gallery album" });
  }
});

// POST /api/gallery/photos (Admin / Uploaded Photo record)
router.post("/photos", authenticateJWT, validateBody(uploadPhotoSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const photo = await prisma.galleryPhoto.create({
      data: {
        albumId: req.body.albumId,
        mediaId: req.body.mediaId,
        caption: req.body.caption,
        uploadedById: req.user!.userId,
      },
      include: { media: true },
    });
    return res.status(201).json(photo);
  } catch (err) {
    return res.status(500).json({ error: "Failed to add photo to gallery" });
  }
});

export default router;
