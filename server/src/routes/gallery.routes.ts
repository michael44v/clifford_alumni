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

// GET /api/gallery/landing-page (Public - Landing page showcase photos)
router.get("/landing-page", async (req, res) => {
  try {
    // First try fetching admin featured photos
    let photos = await prisma.galleryPhoto.findMany({
      where: { isFeatured: true },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { media: true, album: true, uploadedBy: { select: { firstName: true, lastName: true } } },
    });

    // If less than 6 featured photos exist, complement with recent uploaded photos
    if (photos.length < 6) {
      const existingIds = photos.map(p => p.id);
      const remaining = 6 - photos.length;
      const recent = await prisma.galleryPhoto.findMany({
        where: { id: { notIn: existingIds } },
        take: remaining,
        orderBy: { createdAt: "desc" },
        include: { media: true, album: true, uploadedBy: { select: { firstName: true, lastName: true } } },
      });
      photos = [...photos, ...recent];
    }

    return res.json(photos);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch landing page photos" });
  }
});

// POST /api/gallery/upload-multiple (Authenticated User upload multiple photos)
router.post("/upload-multiple", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { albumId, albumTitle, category, photos } = req.body;

    if (!Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ error: "At least one photo is required" });
    }

    let targetAlbumId = albumId;

    // Create a new album if targetAlbumId is not provided
    if (!targetAlbumId) {
      const titleToUse = albumTitle || `Community Showcase - ${new Date().toLocaleDateString()}`;
      const newAlbum = await prisma.galleryAlbum.create({
        data: {
          title: titleToUse,
          category: category || GalleryCategory.INDIVIDUAL_ALUMNI,
          description: "User uploaded showcase photos",
        },
      });
      targetAlbumId = newAlbum.id;
    }

    const createdPhotos = [];

    for (const item of photos) {
      const photoUrl = typeof item === "string" ? item : item.url;
      const caption = typeof item === "string" ? "" : (item.caption || "");

      if (!photoUrl) continue;

      // Create Media record
      const media = await prisma.media.create({
        data: {
          cloudinaryPublicId: `gallery-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          secureUrl: photoUrl,
          folder: "gallery",
        },
      });

      // Create GalleryPhoto record
      const galleryPhoto = await prisma.galleryPhoto.create({
        data: {
          albumId: targetAlbumId,
          mediaId: media.id,
          caption: caption,
          uploadedById: req.user!.userId,
        },
        include: { media: true, album: true },
      });

      createdPhotos.push(galleryPhoto);
    }

    return res.status(201).json({
      message: `Successfully uploaded ${createdPhotos.length} photo(s)`,
      photos: createdPhotos,
      albumId: targetAlbumId,
    });
  } catch (err: any) {
    console.error("Upload multiple gallery photos error:", err);
    return res.status(500).json({ error: "Failed to upload gallery photos" });
  }
});

// GET /api/admin/gallery/photos (Admin View All Uploaded Photos)
router.get("/admin/photos", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN", "MODERATOR"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const photos = await prisma.galleryPhoto.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        media: true,
        album: true,
        uploadedBy: {
          select: { id: true, firstName: true, lastName: true, email: true, matricNumber: true },
        },
      },
    });
    return res.json(photos);
  } catch (err) {
    console.error("Admin fetch gallery photos error:", err);
    return res.status(500).json({ error: "Failed to fetch gallery photos for admin" });
  }
});

// PUT /api/admin/gallery/photos/:id/featured (Admin Toggle Landing Page Feature Status)
router.put("/admin/photos/:id/featured", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { isFeatured } = req.body;

    const updated = await prisma.galleryPhoto.update({
      where: { id },
      data: { isFeatured: Boolean(isFeatured) },
      include: { media: true, album: true, uploadedBy: { select: { firstName: true, lastName: true } } },
    });

    return res.json(updated);
  } catch (err) {
    console.error("Toggle featured photo error:", err);
    return res.status(500).json({ error: "Failed to update featured photo status" });
  }
});

// DELETE /api/admin/gallery/photos/:id (Admin Delete Gallery Photo)
router.delete("/admin/photos/:id", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const photo = await prisma.galleryPhoto.findUnique({ where: { id } });
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    await prisma.galleryPhoto.delete({ where: { id } });
    if (photo.mediaId) {
      await prisma.media.delete({ where: { id: photo.mediaId } }).catch(() => {});
    }

    return res.json({ message: "Photo deleted successfully" });
  } catch (err) {
    console.error("Delete photo error:", err);
    return res.status(500).json({ error: "Failed to delete photo" });
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
