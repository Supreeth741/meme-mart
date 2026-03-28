import { Router } from "express";
import { MediaController } from "../controllers/mediaController";
import { authenticate, optionalAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";
import {
  uploadMediaValidation,
  reportValidation,
  mongoIdParam,
} from "../middleware/validation";

const router = Router();

// Public routes
router.get("/latest", MediaController.getLatest);
router.get("/trending", MediaController.getTrending);
router.get("/category/:slug", MediaController.getByCategory);

// Protected routes (must be before /:id to avoid being caught by param route)
router.get("/user/uploads", authenticate, MediaController.getUserUploads);
router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  uploadMediaValidation,
  MediaController.upload,
);

// Param-based routes
router.get("/:id", mongoIdParam, MediaController.getById);
router.get("/:id/related", mongoIdParam, MediaController.getRelated);
router.get("/:id/stream", mongoIdParam, MediaController.stream);
router.get("/:id/download-file", mongoIdParam, MediaController.downloadFile);
router.post("/:id/download", mongoIdParam, MediaController.download);
router.delete("/:id", authenticate, mongoIdParam, MediaController.deleteMedia);
router.post(
  "/:id/report",
  authenticate,
  mongoIdParam,
  reportValidation,
  MediaController.report,
);

export default router;
