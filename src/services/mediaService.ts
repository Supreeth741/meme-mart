import Media from "../models/Media";
import Category from "../models/Category";
import ActivityLog from "../models/ActivityLog";
import { S3Service } from "./s3Service";
import { UploadMediaDTO, PaginatedResponse, IMedia } from "../interfaces";
import { AppError } from "../middleware/errorHandler";
import { validateFileSize } from "../middleware/upload";
import { logger } from "../utils/logger";

export class MediaService {
  static async upload(
    file: Express.Multer.File,
    data: UploadMediaDTO,
    userId: string,
    uploaderName: string,
  ) {
    try {
      logger.info(
        `[MediaService] Starting upload - UserId: ${userId}, Title: "${data.title}", Type: ${data.mediaType}`,
      );
      logger.debug(
        `[MediaService] File: ${file.originalname}, Size: ${file.size} bytes, MimeType: ${file.mimetype}`,
      );

      // Validate file size per media type
      logger.info(
        `[MediaService] Validating file size - MediaType: ${data.mediaType}, Size: ${file.size}`,
      );
      validateFileSize(data.mediaType, file.size);
      logger.info(`[MediaService] File size validation passed`);

      // Upload to S3
      logger.info(
        `[MediaService] Uploading to S3 - MediaType: ${data.mediaType}`,
      );
      const { url, key } = await S3Service.uploadFile(file, data.mediaType);
      logger.info(
        `[MediaService] S3 upload successful - URL: ${url}, Key: ${key}`,
      );

      // Create media record
      logger.info(`[MediaService] Creating media record in database`);
      const media = await Media.create({
        title: data.title,
        category: data.category,
        mediaType: data.mediaType,
        mediaUrl: url,
        s3Key: key,
        uploadedBy: userId,
        uploaderName,
        resolution: data.resolution,
        fps: data.fps,
        duration: data.duration,
        bitrate: data.bitrate,
        format: data.format,
        fileSize: file.size,
        tags: data.tags || [],
      });
      logger.info(
        `[MediaService] Media record created - ID: ${media._id}, Category: ${data.category}`,
      );

      // Update category count
      logger.info(
        `[MediaService] Updating category count - Category: ${data.category}`,
      );
      const catResult = await Category.findOneAndUpdate(
        { slug: data.category.toLowerCase().replace(/\s+/g, "-") },
        { $inc: { mediaCount: 1 } },
      );
      logger.info(
        `[MediaService] Category updated - Category: ${data.category}`,
      );

      // Log activity
      logger.info(`[MediaService] Creating activity log - UserId: ${userId}`);
      await ActivityLog.create({
        userId,
        action: "upload",
        details: `Uploaded ${data.mediaType}: ${data.title}`,
      });
      logger.info(`[MediaService] Activity logged successfully`);

      logger.info(
        `[MediaService] Upload completed successfully - Media ID: ${media._id}`,
      );
      return media;
    } catch (error) {
      logger.error(
        `[MediaService] Upload failed - UserId: ${userId}, Title: "${data.title}", Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      if (error instanceof Error) {
        logger.error(`[MediaService] Stack trace: ${error.stack}`);
      }
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      logger.info(`[MediaService] Fetching media - ID: ${id}`);
      const media = await Media.findById(id);
      if (!media) {
        logger.warn(`[MediaService] Media not found - ID: ${id}`);
        throw new AppError("Media not found", 404);
      }

      // Increment view count
      media.views += 1;
      media.engagement = media.views + media.downloads * 3;
      await media.save();
      logger.debug(
        `[MediaService] Views updated - ID: ${id}, NewViews: ${media.views}`,
      );

      // Compute tags
      const tags: string[] = [...media.tags];
      if (media.isViral && !tags.includes("Viral")) tags.push("Viral");
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      if (media.createdAt >= tenDaysAgo && !tags.includes("Latest"))
        tags.push("Latest");

      // Generate signed stream URL for playback
      const streamUrl = await S3Service.getSignedStreamUrl(media.s3Key);

      logger.info(`[MediaService] Media fetched successfully - ID: ${id}`);
      return { ...media.toObject(), computedTags: tags, streamUrl };
    } catch (error) {
      logger.error(
        `[MediaService] Failed to fetch media - ID: ${id}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  static async getLatest(mediaType?: string, limit: number = 10) {
    try {
      logger.info(
        `[MediaService] Fetching latest media - MediaType: ${mediaType || "all"}, Limit: ${limit}`,
      );
      const filter: any = {};
      if (mediaType) filter.mediaType = mediaType;

      const results = await Media.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      logger.info(`[MediaService] Found ${results.length} latest media items`);
      return results;
    } catch (error) {
      logger.error(
        `[MediaService] Failed to fetch latest media - Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  static async getTrending(limit: number = 10): Promise<any[]> {
    try {
      logger.info(`[MediaService] Fetching trending media - Limit: ${limit}`);

      // Get media sorted by engagement score with recency factor
      const media = await Media.find()
        .sort({ engagement: -1, views: -1, createdAt: -1 })
        .limit(limit * 2)
        .lean();

      logger.debug(
        `[MediaService] Retrieved ${media.length} media items for trending calculation`,
      );

      // Apply trending score calculation
      const scored = media.map((m) => {
        const ageInHours =
          (Date.now() - new Date(m.createdAt).getTime()) / (1000 * 60 * 60);
        const recencyBoost = Math.max(0, 1 - ageInHours / 720);
        const score =
          (m.views * 1 + m.downloads * 3 + m.engagement * 2) *
          (1 + recencyBoost);
        return { ...m, trendingScore: score };
      });

      scored.sort((a, b) => b.trendingScore - a.trendingScore);
      const results = scored.slice(0, limit);

      logger.info(
        `[MediaService] Trending media calculated successfully - Count: ${results.length}`,
      );
      return results;
    } catch (error) {
      logger.error(
        `[MediaService] Failed to fetch trending media - Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  static async getByCategory(
    categorySlug: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<IMedia>> {
    try {
      logger.info(
        `[MediaService] Fetching media by category - CategorySlug: ${categorySlug}, Page: ${page}, Limit: ${limit}`,
      );

      const category = await Category.findOne({ slug: categorySlug });
      if (!category) {
        logger.warn(
          `[MediaService] Category not found - Slug: ${categorySlug}`,
        );
        throw new AppError("Category not found", 404);
      }

      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        Media.find({ category: category.name })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Media.countDocuments({ category: category.name }),
      ]);

      logger.info(
        `[MediaService] Found ${data.length} media items in category - Category: ${category.name}, Total: ${total}`,
      );

      return {
        data: data as unknown as IMedia[],
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error(
        `[MediaService] Failed to fetch media by category - CategorySlug: ${categorySlug}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  static async getUserUploads(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      logger.info(
        `[MediaService] Fetching user uploads - UserId: ${userId}, Page: ${page}, Limit: ${limit}`,
      );

      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        Media.find({ uploadedBy: userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Media.countDocuments({ uploadedBy: userId }),
      ]);

      logger.info(
        `[MediaService] Found ${data.length} uploads for user - UserId: ${userId}, Total: ${total}`,
      );

      return {
        data,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error(
        `[MediaService] Failed to fetch user uploads - UserId: ${userId}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  static async getStreamUrl(id: string): Promise<string> {
    const media = await Media.findById(id);
    if (!media) {
      throw new AppError("Media not found", 404);
    }
    return S3Service.getSignedStreamUrl(media.s3Key);
  }

  static async getFileForDownload(id: string) {
    try {
      logger.info(`[MediaService] Preparing file download - ID: ${id}`);
      const media = await Media.findById(id);
      if (!media) {
        throw new AppError("Media not found", 404);
      }

      // Increment download count
      media.downloads += 1;
      media.engagement = media.views + media.downloads * 3;
      await media.save();

      const s3Object = await S3Service.getFileObject(media.s3Key);
      const ext = media.s3Key.split(".").pop() || "";

      logger.info(`[MediaService] File download ready - ID: ${id}`);
      return {
        stream: s3Object.Body,
        contentType: s3Object.ContentType || "application/octet-stream",
        contentLength: s3Object.ContentLength,
        filename: `${media.title}.${ext}`,
      };
    } catch (error) {
      logger.error(
        `[MediaService] File download failed - ID: ${id}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  static async incrementDownload(id: string) {
    try {
      logger.info(`[MediaService] Incrementing download count - ID: ${id}`);
      const media = await Media.findById(id);
      if (!media) {
        logger.warn(`[MediaService] Media not found for download - ID: ${id}`);
        throw new AppError("Media not found", 404);
      }

      media.downloads += 1;
      media.engagement = media.views + media.downloads * 3;
      await media.save();
      logger.debug(
        `[MediaService] Download count updated - ID: ${id}, NewDownloads: ${media.downloads}`,
      );

      // Generate a signed download URL with Content-Disposition
      logger.info(
        `[MediaService] Generating signed download URL - Key: ${media.s3Key}`,
      );
      const downloadUrl = await S3Service.getSignedDownloadUrl(media.s3Key);
      logger.info(
        `[MediaService] Download URL generated successfully - ID: ${id}`,
      );

      return { ...media.toObject(), downloadUrl };
    } catch (error) {
      logger.error(
        `[MediaService] Failed to increment download - ID: ${id}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  static async deleteMedia(
    id: string,
    userId: string,
    isAdmin: boolean = false,
  ) {
    try {
      logger.info(
        `[MediaService] Deleting media - ID: ${id}, UserId: ${userId}, IsAdmin: ${isAdmin}`,
      );

      const media = await Media.findById(id);
      if (!media) {
        logger.warn(`[MediaService] Media not found for deletion - ID: ${id}`);
        throw new AppError("Media not found", 404);
      }

      if (!isAdmin && media.uploadedBy.toString() !== userId) {
        logger.warn(
          `[MediaService] Unauthorized deletion attempt - ID: ${id}, UserId: ${userId}, UploadedBy: ${media.uploadedBy}`,
        );
        throw new AppError("Not authorized to delete this media", 403);
      }

      // Delete from S3
      logger.info(`[MediaService] Deleting from S3 - Key: ${media.s3Key}`);
      try {
        await S3Service.deleteFile(media.s3Key);
        logger.info(
          `[MediaService] S3 deletion successful - Key: ${media.s3Key}`,
        );
      } catch (s3Error) {
        logger.error(
          `[MediaService] S3 deletion failed - Key: ${media.s3Key}, Error: ${s3Error instanceof Error ? s3Error.message : String(s3Error)}`,
        );
        // Continue with DB deletion even if S3 fails
      }

      // Update category count
      logger.info(
        `[MediaService] Updating category count - Category: ${media.category}`,
      );
      await Category.findOneAndUpdate(
        { name: media.category },
        { $inc: { mediaCount: -1 } },
      );

      logger.info(`[MediaService] Deleting from database - ID: ${id}`);
      await Media.findByIdAndDelete(id);

      await ActivityLog.create({
        userId,
        action: "delete_media",
        details: `Deleted ${media.mediaType}: ${media.title}`,
      });

      logger.info(`[MediaService] Media deleted successfully - ID: ${id}`);
    } catch (error) {
      logger.error(
        `[MediaService] Failed to delete media - ID: ${id}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  static async toggleViral(id: string) {
    try {
      logger.info(`[MediaService] Toggling viral status - ID: ${id}`);

      const media = await Media.findById(id);
      if (!media) {
        logger.warn(
          `[MediaService] Media not found for viral toggle - ID: ${id}`,
        );
        throw new AppError("Media not found", 404);
      }

      media.isViral = !media.isViral;
      await media.save();

      logger.info(
        `[MediaService] Viral status toggled - ID: ${id}, IsViral: ${media.isViral}`,
      );
      return media;
    } catch (error) {
      logger.error(
        `[MediaService] Failed to toggle viral status - ID: ${id}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  static async getRelated(id: string, limit: number = 4) {
    try {
      logger.info(
        `[MediaService] Fetching related media - ID: ${id}, Limit: ${limit}`,
      );

      const media = await Media.findById(id);
      if (!media) {
        logger.warn(
          `[MediaService] Media not found for related items - ID: ${id}`,
        );
        throw new AppError("Media not found", 404);
      }

      // Get related by same category, excluding current media
      const relatedByCategory = await Media.find({
        _id: { $ne: id },
        category: media.category,
      })
        .sort({ views: -1, createdAt: -1 })
        .limit(limit)
        .lean();

      logger.debug(
        `[MediaService] Found ${relatedByCategory.length} related media by category - Category: ${media.category}`,
      );

      // Get related by same media type, excluding current and already fetched
      const excludeIds = [
        id,
        ...relatedByCategory.map((m) => m._id.toString()),
      ];
      const relatedByType = await Media.find({
        _id: { $nin: excludeIds },
        mediaType: media.mediaType,
      })
        .sort({ views: -1, createdAt: -1 })
        .limit(limit)
        .lean();

      logger.debug(
        `[MediaService] Found ${relatedByType.length} related media by type - Type: ${media.mediaType}`,
      );
      logger.info(
        `[MediaService] Related media fetched successfully - ID: ${id}`,
      );

      return { relatedByCategory, relatedByType };
    } catch (error) {
      logger.error(
        `[MediaService] Failed to fetch related media - ID: ${id}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
