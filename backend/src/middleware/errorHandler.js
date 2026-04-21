/**
 * Catch-all 404 handler. Must be mounted after all valid routes.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

/**
 * Global error handler. Express identifies 4-argument functions as error handlers.
 * - Errors with err.status < 500 are client errors: message is safe to expose.
 * - Everything else is a server error: log it, return a generic message.
 */
export function errorHandler(err, req, res, next) {
  const status = err.status ?? err.statusCode ?? 500;
  const message = status < 500 ? err.message : "Internal server error.";

  if (status >= 500) {
    console.error("[error]", err);
  }

  res.status(status).json({ error: message });
}
