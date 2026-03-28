import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../config/s3";
import { env } from "../config/env";
import { logger } from "../utils/logger";
// import { v4 as uuidv4 } from 'crypto';
import crypto from "crypto";

export class S3Service {
  private static generateKey(mediaType: string, originalName: string): string {
    const ext = originalName.split(".").pop() || "";
    const uniqueId = crypto.randomUUID();
    return `${mediaType}s/${uniqueId}.${ext}`;
  }

  static async uploadFile(
    file: Express.Multer.File,
    mediaType: string,
  ): Promise<{ url: string; key: string }> {
    const key = this.generateKey(mediaType, file.originalname);

    try {
      logger.info(
        `[S3] Starting file upload - Key: ${key}, Size: ${file.size} bytes, MimeType: ${file.mimetype}`,
      );
      logger.debug(
        `[S3] AWS Config - Bucket: ${env.aws.bucketName}, Region: ${env.aws.region}`,
      );

      // Validate AWS credentials
      if (!env.aws.accessKeyId) {
        logger.error("[S3] AWS_ACCESS_KEY_ID is missing or empty");
        throw new Error("AWS access key ID is not configured");
      }
      if (!env.aws.secretAccessKey) {
        logger.error("[S3] AWS_SECRET_ACCESS_KEY is missing or empty");
        throw new Error("AWS secret access key is not configured");
      }
      if (!env.aws.bucketName) {
        logger.error("[S3] AWS_BUCKET_NAME is missing or empty");
        throw new Error("AWS bucket name is not configured");
      }

      const command = new PutObjectCommand({
        Bucket: env.aws.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      logger.info(`[S3] Executing PutObjectCommand for key: ${key}`);
      await s3Client.send(command);

      const url = `https://${env.aws.bucketName}.s3.${env.aws.region}.amazonaws.com/${key}`;
      logger.info(`[S3] File uploaded successfully - URL: ${url}`);

      return { url, key };
    } catch (error) {
      logger.error(
        `[S3] Upload failed - Key: ${key}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      if (error instanceof Error) {
        logger.error(`[S3] Stack trace: ${error.stack}`);
      }
      throw new Error(
        `S3 upload failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static async deleteFile(key: string): Promise<void> {
    try {
      logger.info(`[S3] Starting file deletion - Key: ${key}`);

      const command = new DeleteObjectCommand({
        Bucket: env.aws.bucketName,
        Key: key,
      });

      await s3Client.send(command);
      logger.info(`[S3] File deleted successfully - Key: ${key}`);
    } catch (error) {
      logger.error(
        `[S3] Delete failed - Key: ${key}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  static async getSignedDownloadUrl(
    key: string,
    filename?: string,
  ): Promise<string> {
    try {
      logger.info(
        `[S3] Generating signed download URL - Key: ${key}, Filename: ${filename || "N/A"}`,
      );

      const command = new GetObjectCommand({
        Bucket: env.aws.bucketName,
        Key: key,
        ResponseContentDisposition: `attachment; filename="${filename || key.split("/").pop()}"`,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });
      logger.info(`[S3] Signed URL generated successfully - Key: ${key}`);

      return signedUrl;
    } catch (error) {
      logger.error(
        `[S3] Signed URL generation failed - Key: ${key}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  static async getFileObject(key: string) {
    try {
      logger.info(`[S3] Getting file object - Key: ${key}`);

      const command = new GetObjectCommand({
        Bucket: env.aws.bucketName,
        Key: key,
      });

      const response = await s3Client.send(command);
      logger.info(`[S3] File object retrieved - Key: ${key}`);
      return response;
    } catch (error) {
      logger.error(
        `[S3] Failed to get file object - Key: ${key}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  static async getSignedStreamUrl(key: string): Promise<string> {
    try {
      logger.info(`[S3] Generating signed stream URL - Key: ${key}`);

      const command = new GetObjectCommand({
        Bucket: env.aws.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });
      logger.info(
        `[S3] Signed stream URL generated successfully - Key: ${key}`,
      );

      return signedUrl;
    } catch (error) {
      logger.error(
        `[S3] Signed stream URL generation failed - Key: ${key}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
