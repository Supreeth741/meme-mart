import { Document } from "mongoose";

// User
export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  firebaseUid?: string;
  avatar?: string;
  role: "user" | "admin";
  isVerified: boolean;
  favourites: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Media
export type MediaType = "video" | "image" | "audio";

export interface IMedia extends Document {
  title: string;
  category: string;
  mediaType: MediaType;
  mediaUrl: string;
  s3Key: string;
  uploadedBy: string; // user ID
  uploaderName: string;
  resolution?: string;
  fps?: number;
  duration?: number;
  bitrate?: number;
  format?: string;
  fileSize: number;
  tags: string[];
  isViral: boolean;
  views: number;
  downloads: number;
  engagement: number;
  createdAt: Date;
  updatedAt: Date;
}

// Category
export interface ICategory extends Document {
  name: string;
  slug: string;
  icon?: string;
  mediaCount: number;
  createdAt: Date;
}

// Report
export interface IReport extends Document {
  mediaId: string;
  reportedBy: string;
  reason: string;
  description?: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: Date;
}

// Activity Log
export interface IActivityLog extends Document {
  userId: string;
  action: string;
  details?: string;
  ipAddress?: string;
  createdAt: Date;
}

// DTOs
export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UploadMediaDTO {
  title: string;
  category: string;
  mediaType: MediaType;
  tags?: string[];
  resolution?: string;
  fps?: number;
  duration?: number;
  bitrate?: number;
  format?: string;
}

export interface SearchQuery {
  q?: string;
  category?: string;
  mediaType?: MediaType;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthPayload {
  userId: string;
  role: string;
}

export interface AnalyticsData {
  totalUsers: number;
  totalMedia: number;
  totalDownloads: number;
  totalViews: number;
  mediaByType: { _id: string; count: number }[];
  recentUploads: number;
  recentUsers: number;
  topMedia: IMedia[];
  uploadTrend: { _id: string; count: number }[];
}
