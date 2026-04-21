import { Router } from "express";
import {
  listDocuments,
  ingestDocument,
  deleteDocument,
} from "../controllers/document.controller.js";

const router = Router();

router.get("/", listDocuments);
router.post("/ingest", ingestDocument);
router.delete("/:id", deleteDocument);

export default router;
