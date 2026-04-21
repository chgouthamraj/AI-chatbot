import * as documentService from "../services/document.service.js";

/**
 * GET /api/documents
 */
export async function listDocuments(req, res, next) {
  try {
    const documents = await documentService.listDocuments();
    res.json({ documents });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/documents/ingest
 * Body: { text: string, metadata?: object }
 */
export async function ingestDocument(req, res, next) {
  try {
    const text = req.body?.text?.trim();
    const metadata = req.body?.metadata ?? {};

    if (!text) {
      return res.status(400).json({ error: "text is required." });
    }

    const result = await documentService.ingestDocument(text, metadata);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/documents/:id
 */
export async function deleteDocument(req, res, next) {
  try {
    await documentService.deleteDocument(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
