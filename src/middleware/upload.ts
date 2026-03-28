import multer from 'multer';
import path from 'path';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

const MIME_TYPES: Record<string, string[]> = {
  video: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/mp4'],
};

const MAX_SIZES: Record<string, number> = {
  video: 5 * 1024 * 1024,    // 5MB
  image: 2 * 1024 * 1024,    // 2MB
  audio: 1 * 1024 * 1024,    // 1MB
};

const ALL_ALLOWED_MIMES = [...MIME_TYPES.video, ...MIME_TYPES.image, ...MIME_TYPES.audio];

const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  logger.debug(`[UploadMiddleware] Filtering file - Name: ${file.originalname}, MimeType: ${file.mimetype}, Size: ${file.size}`);
  
  if (ALL_ALLOWED_MIMES.includes(file.mimetype)) {
    logger.debug(`[UploadMiddleware] File type accepted - MimeType: ${file.mimetype}`);
    cb(null, true);
  } else {
    logger.warn(`[UploadMiddleware] File type rejected - MimeType: ${file.mimetype}, Allowed: ${ALL_ALLOWED_MIMES.join(', ')}`);
    cb(new AppError(`File type ${file.mimetype} is not supported`, 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max (validated per type in controller)
  },
});

export const validateFileSize = (mediaType: string, fileSize: number): void => {
  logger.debug(`[UploadMiddleware] Validating file size - MediaType: ${mediaType}, FileSize: ${fileSize} bytes`);
  
  const maxSize = MAX_SIZES[mediaType];
  if (maxSize && fileSize > maxSize) {
    const maxMB = maxSize / (1024 * 1024);
    const fileMB = (fileSize / (1024 * 1024)).toFixed(2);
    logger.warn(`[UploadMiddleware] File size exceeded - MediaType: ${mediaType}, FileSize: ${fileMB}MB, MaxSize: ${maxMB}MB`);
    throw new AppError(`${mediaType} files must be under ${maxMB}MB`, 400);
  }
  
  logger.debug(`[UploadMiddleware] File size validation passed - MediaType: ${mediaType}`);
};

export const getMediaTypeFromMime = (mimetype: string): string | null => {
  for (const [type, mimes] of Object.entries(MIME_TYPES)) {
    if (mimes.includes(mimetype)) {
      logger.debug(`[UploadMiddleware] Media type detected - MimeType: ${mimetype}, Type: ${type}`);
      return type;
    }
  }
  logger.warn(`[UploadMiddleware] Unknown media type - MimeType: ${mimetype}`);
  return null;
};
