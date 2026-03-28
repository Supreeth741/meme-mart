import mongoose, { Schema } from 'mongoose';
import { IReport } from '../interfaces';

const reportSchema = new Schema<IReport>(
  {
    mediaId: {
      type: String,
      ref: 'Media',
      required: true,
      index: true,
    },
    reportedBy: {
      type: String,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ['inappropriate', 'copyright', 'spam', 'offensive', 'other'],
    },
    description: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IReport>('Report', reportSchema);
