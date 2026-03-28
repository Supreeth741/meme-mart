import { Request, Response, NextFunction } from "express";
import { MediaService } from "../services/mediaService";
import { ReportService } from "../services/reportService";
import { logger } from "../utils/logger";

export class MediaController {
  static async upload(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(
        `[MediaController] Upload request received - UserId: ${req.userId}, File: ${req.file?.originalname || "N/A"}`,
      );

      if (!req.file) {
        logger.warn("[MediaController] Upload rejected - no file provided");
        res.status(400).json({ message: "File is required" });
        return;
      }

      logger.info(
        `[MediaController] Processing upload - File: ${req.file.originalname}, Size: ${req.file.size}, MimeType: ${req.file.mimetype}`,
      );
      logger.debug(
        `[MediaController] Upload data - Title: "${req.body.title}", Category: "${req.body.category}", MediaType: "${req.body.mediaType}"`,
      );

      const media = await MediaService.upload(
        req.file,
        req.body,
        req.userId!,
        req.user!.username,
      );

      logger.info(
        `[MediaController] Upload successful - MediaId: ${media._id}, File: ${req.file.originalname}`,
      );
      res.status(201).json({ status: "success", data: media });
    } catch (error) {
      logger.error(
        `[MediaController] Upload failed - UserId: ${req.userId}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      if (error instanceof Error) {
        logger.error(`[MediaController] Stack trace: ${error.stack}`);
      }
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(
        `[MediaController] Get media by ID - MediaId: ${req.params.id}`,
      );
      const media = await MediaService.getById(req.params.id);
      logger.info(
        `[MediaController] Media retrieved - MediaId: ${req.params.id}`,
      );
      res.json({ status: "success", data: media });
    } catch (error) {
      logger.error(
        `[MediaController] Get by ID failed - MediaId: ${req.params.id}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      next(error);
    }
  }

  static async getLatest(req: Request, res: Response, next: NextFunction) {
    try {
      const { mediaType, limit } = req.query;
      logger.info(
        `[MediaController] Get latest media - MediaType: ${mediaType || "all"}, Limit: ${limit || 10}`,
      );

      const data = await MediaService.getLatest(
        mediaType as string | undefined,
        limit ? parseInt(limit as string) : 10,
      );

      logger.info(
        `[MediaController] Latest media retrieved - Count: ${data.length}`,
      );
      res.json({ status: "success", data });
    } catch (error) {
      logger.error(
        `[MediaController] Get latest failed - Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      next(error);
    }
  }

  static async getTrending(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit } = req.query;
      logger.info(
        `[MediaController] Get trending media - Limit: ${limit || 10}`,
      );

      const data = await MediaService.getTrending(
        limit ? parseInt(limit as string) : 10,
      );

      logger.info(
        `[MediaController] Trending media retrieved - Count: ${data.length}`,
      );
      res.json({ status: "success", data });
    } catch (error) {
      logger.error(
        `[MediaController] Get trending failed - Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      next(error);
    }
  }

  static async getByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const { page, limit } = req.query;
      logger.info(
        `[MediaController] Get media by category - Slug: ${slug}, Page: ${page || 1}, Limit: ${limit || 10}`,
      );

      const data = await MediaService.getByCategory(
        slug,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 10,
      );

      logger.info(
        `[MediaController] Category media retrieved - Found: ${data.data.length}, Total: ${data.total}`,
      );
      res.json({ status: "success", data });
    } catch (error) {
      logger.error(
        `[MediaController] Get by category failed - Slug: ${req.params.slug}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      next(error);
    }
  }

  static async getUserUploads(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      logger.info(
        `[MediaController] Get user uploads - UserId: ${req.userId}, Page: ${page || 1}, Limit: ${limit || 10}`,
      );

      const data = await MediaService.getUserUploads(
        req.userId!,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 10,
      );

      logger.info(
        `[MediaController] User uploads retrieved - Found: ${data.data.length}, Total: ${data.total}`,
      );
      res.json({ status: "success", data });
    } catch (error) {
      logger.error(
        `[MediaController] Get user uploads failed - UserId: ${req.userId}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      next(error);
    }
  }

  static async download(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(
        `[MediaController] Download request - MediaId: ${req.params.id}`,
      );

      const result = await MediaService.incrementDownload(req.params.id);

      logger.info(
        `[MediaController] Download URL generated - MediaId: ${req.params.id}`,
      );
      res.json({
        status: "success",
        data: { downloadUrl: result.downloadUrl },
      });
    } catch (error) {
      logger.error(
        `[MediaController] Download failed - MediaId: ${req.params.id}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      next(error);
    }
  }

  static async downloadFile(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(
        `[MediaController] File download request - MediaId: ${req.params.id}`,
      );

      const result = await MediaService.getFileForDownload(req.params.id);

      res.set({
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(result.filename)}"`,
      });
      if (result.contentLength) {
        res.set("Content-Length", result.contentLength.toString());
      }

      const stream = result.stream as any;
      stream.pipe(res);

      logger.info(
        `[MediaController] File download streaming - MediaId: ${req.params.id}`,
      );
    } catch (error) {
      logger.error(
        `[MediaController] File download failed - MediaId: ${req.params.id}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      next(error);
    }
  }

  static async stream(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(
        `[MediaController] Stream request - MediaId: ${req.params.id}`,
      );

      const streamUrl = await MediaService.getStreamUrl(req.params.id);

      logger.info(
        `[MediaController] Stream URL generated - MediaId: ${req.params.id}`,
      );
      res.set("Cache-Control", "private, max-age=3500");
      res.redirect(302, streamUrl);
    } catch (error) {
      logger.error(
        `[MediaController] Stream failed - MediaId: ${req.params.id}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      next(error);
    }
  }

  static async getRelated(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit } = req.query;
      logger.info(
        `[MediaController] Get related media - MediaId: ${req.params.id}, Limit: ${limit || 4}`,
      );

      const data = await MediaService.getRelated(
        req.params.id,
        limit ? parseInt(limit as string) : 4,
      );

      logger.info(
        `[MediaController] Related media retrieved - ByCategory: ${data.relatedByCategory.length}, ByType: ${data.relatedByType.length}`,
      );
      res.json({ status: "success", data });
    } catch (error) {
      logger.error(
        `[MediaController] Get related failed - MediaId: ${req.params.id}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      next(error);
    }
  }

  static async deleteMedia(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(
        `[MediaController] Delete request received - MediaId: ${req.params.id}, UserId: ${req.userId}`,
      );

      const isAdmin = req.user?.role === "admin";
      logger.debug(
        `[MediaController] User role - UserId: ${req.userId}, IsAdmin: ${isAdmin}`,
      );

      await MediaService.deleteMedia(req.params.id, req.userId!, isAdmin);

      logger.info(
        `[MediaController] Media deleted successfully - MediaId: ${req.params.id}`,
      );
      res.json({ status: "success", message: "Media deleted" });
    } catch (error) {
      logger.error(
        `[MediaController] Delete failed - MediaId: ${req.params.id}, UserId: ${req.userId}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      next(error);
    }
  }

  static async report(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(
        `[MediaController] Report request - MediaId: ${req.params.id}, UserId: ${req.userId}, Reason: ${req.body.reason}`,
      );

      const report = await ReportService.create(
        req.params.id,
        req.userId!,
        req.body.reason,
        req.body.description,
      );

      logger.info(
        `[MediaController] Report created successfully - ReportId: ${report._id}, MediaId: ${req.params.id}`,
      );
      res.status(201).json({ status: "success", data: report });
    } catch (error) {
      logger.error(
        `[MediaController] Report failed - MediaId: ${req.params.id}, UserId: ${req.userId}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      next(error);
    }
  }
}
