import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { authenticateJWT, requireRole, AuthenticatedRequest } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

const router = Router();

const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  eventDate: z.string(), // ISO string
  time: z.string(),
  venue: z.string(),
  isVirtual: z.boolean().optional(),
  meetingLink: z.string().optional(),
  organizer: z.string().optional(),
  category: z.string().optional(),
  capacity: z.number().optional(),
  bannerMediaId: z.string().optional(),
});

// GET /api/events (Public / Paginated)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        skip,
        take: limit,
        orderBy: { eventDate: "asc" },
        include: {
          banner: true,
          _count: { select: { registrations: true } },
        },
      }),
      prisma.event.count(),
    ]);

    return res.json({
      data: events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch events" });
  }
});

// GET /api/events/:slug
router.get("/:slug", async (req, res) => {
  try {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        banner: true,
        registrations: {
          include: {
            member: {
              select: { id: true, firstName: true, lastName: true, profilePhoto: true },
            },
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.json(event);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch event" });
  }
});

// POST /api/events/:id/register (RSVP for logged in members)
router.post("/:id/register", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const eventId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const memberId = req.user!.userId;

    const existingReg = await prisma.eventRegistration.findUnique({
      where: { eventId_memberId: { eventId, memberId } },
    });

    if (existingReg) {
      return res.status(400).json({ error: "You are already registered for this event." });
    }

    const reg = await prisma.eventRegistration.create({
      data: {
        eventId,
        memberId,
      },
    });

    return res.status(201).json({ message: "RSVP successful", registration: reg });
  } catch (err) {
    return res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/events (Admin Create)
router.post("/", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN"), validateBody(createEventSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, eventDate, time, venue, isVirtual, meetingLink, organizer, category, capacity, bannerMediaId } = req.body;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();

    const newEvent = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        eventDate: new Date(eventDate),
        time,
        venue,
        isVirtual: isVirtual || false,
        meetingLink,
        organizer: organizer || "CUAA",
        category: category || "General",
        capacity,
        bannerMediaId,
        createdById: req.user!.userId,
      },
      include: { banner: true },
    });

    return res.status(201).json(newEvent);
  } catch (err) {
    console.error("Create event error:", err);
    return res.status(500).json({ error: "Failed to create event" });
  }
});

export default router;
