import { chat } from "../services/chat.service.js";

/**
 * POST /api/chat
 * Body: { question: string, sessionId?: string }
 * Header: x-session-id (takes precedence over body.sessionId)
 */
export async function handleChat(req, res, next) {
  try {
    const question = req.body?.question?.trim();

    if (!question) {
      return res.status(400).json({ error: "question is required." });
    }
    if (question.length > 500) {
      return res.status(413).json({ error: "question is too long (max 500 characters)." });
    }

    const sessionId = req.headers["x-session-id"] ?? req.body?.sessionId ?? "default";

    const answer = await chat({ question, sessionId });
    res.json({ answer, sessionId });
  } catch (err) {
    next(err);
  }
}
