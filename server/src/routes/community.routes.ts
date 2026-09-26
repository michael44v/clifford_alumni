import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { authenticateJWT, requireVerifiedAlumni, AuthenticatedRequest } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

const router = Router();

const createPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(5),
  category: z.string().optional(),
  mediaId: z.string().optional(),
});

const createCommentSchema = z.object({
  content: z.string().min(1),
});

const sendMessageSchema = z.object({
  receiverId: z.string().uuid(),
  messageText: z.string().min(1),
});

// GET /api/community/posts (Paginated discussion forum)
router.get("/posts", authenticateJWT, requireVerifiedAlumni, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category as string | undefined;

    const whereClause: any = {};
    if (category && category !== "All") whereClause.category = category;

    const [posts, total] = await Promise.all([
      prisma.discussionPost.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, profilePhoto: true } },
          media: true,
          _count: { select: { comments: true } },
        },
      }),
      prisma.discussionPost.count({ where: whereClause }),
    ]);

    return res.json({
      data: posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch discussion posts" });
  }
});

// POST /api/community/posts
router.post("/posts", authenticateJWT, requireVerifiedAlumni, validateBody(createPostSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const post = await prisma.discussionPost.create({
      data: {
        authorId: req.user!.userId,
        title: req.body.title,
        content: req.body.content,
        category: req.body.category || "General",
        mediaId: req.body.mediaId,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, profilePhoto: true } },
      },
    });

    return res.status(201).json(post);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create post" });
  }
});

// POST /api/community/posts/:id/comments
router.post("/posts/:id/comments", authenticateJWT, requireVerifiedAlumni, validateBody(createCommentSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const comment = await prisma.discussionComment.create({
      data: {
        postId,
        authorId: req.user!.userId,
        content: req.body.content,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, profilePhoto: true } },
      },
    });

    return res.status(201).json(comment);
  } catch (err) {
    return res.status(500).json({ error: "Failed to add comment" });
  }
});

// GET /api/community/chat/messages/:otherMemberId
router.get("/chat/messages/:otherMemberId", authenticateJWT, requireVerifiedAlumni, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const otherId = Array.isArray(req.params.otherMemberId) ? req.params.otherMemberId[0] : req.params.otherMemberId;

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId },
        ],
      },
      orderBy: { sentAt: "asc" },
    });

    return res.json(messages);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch chat messages" });
  }
});

// POST /api/community/chat/send
router.post("/chat/send", authenticateJWT, requireVerifiedAlumni, validateBody(sendMessageSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const message = await prisma.chatMessage.create({
      data: {
        senderId: req.user!.userId,
        receiverId: req.body.receiverId,
        messageText: req.body.messageText,
      },
    });

    return res.status(201).json(message);
  } catch (err) {
    return res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
