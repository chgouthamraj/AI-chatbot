import { config } from "../config/index.js";

/**
 * Validates the x-api-key request header against the configured API key.
 * Applied to all /api/* routes — the /health route is intentionally excluded
 * so load balancers and uptime monitors can reach it without credentials.
 */
export function requireApiKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (!key || key !== config.apiKey) {
    return res.status(401).json({ error: "Unauthorized: invalid or missing API key." });
  }
  next();
}
