import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { apiLimiter } from "./middleware/rateLimit.js";

import authRoutes from "./routes/auth.routes.js";
import memberRoutes from "./routes/member.routes.js";
import eventRoutes from "./routes/event.routes.js";
import newsRoutes from "./routes/news.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";
import businessRoutes from "./routes/business.routes.js";
import financeRoutes from "./routes/finance.routes.js";
import welfareRoutes from "./routes/welfare.routes.js";
import communityRoutes from "./routes/community.routes.js";
import adminRoutes from "./routes/admin.routes.js";

export const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api", apiLimiter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Clifford University Alumni Backend", timestamp: new Date() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/welfare", welfareRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/admin", adminRoutes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled API Error:", err);
  res.status(500).json({ error: "An internal server error occurred" });
});
