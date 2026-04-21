import { Router } from "express";
import { requireApiKey } from "../middleware/auth.js";
import healthRouter from "./health.js";
import chatRouter from "./chat.js";
import documentsRouter from "./documents.js";

const router = Router();

// Public — no auth required (load balancers, uptime monitors)
router.use("/health", healthRouter);

// All /api routes require a valid x-api-key header
router.use("/api", requireApiKey);
router.use("/api/chat", chatRouter);
router.use("/api/documents", documentsRouter);

export default router;
