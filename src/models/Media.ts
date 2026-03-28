import mongoose, { Schema } from 'mongoose';
import { IMedia } from '../interfaces';

const mediaSchema = new Schema<IMedia>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: 'text',
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    mediaType: {
      type: String,
      required: true,
      enum: ['video', 'image', 'audio'],
      index: true,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    s3Key: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    uploaderName: {
      type: String,
      required: true,
    },
    resolution: {
      type: String,
    },
    fps: {
      type: Number,
    },
    duration: {
      type: Number,
    },
    bitrate: {
      type: Number,
    },
    format: {
      type: String,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isViral: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    engagement: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

mediaSchema.index({ title: 'text', tags: 'text' });
mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ views: -1 });
mediaSchema.index({ downloads: -1 });
mediaSchema.index({ engagement: -1 });

// Trending score: weighted combination
mediaSchema.methods.getTrendingScore = function (): number {
  const ageInHours = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60);
  const recencyBoost = Math.max(0, 1 - ageInHours / 720); // decay over 30 days
  return (this.views * 1 + this.downloads * 3 + this.engagement * 2) * (1 + recencyBoost);
};

export default mongoose.model<IMedia>('Media', mediaSchema);
