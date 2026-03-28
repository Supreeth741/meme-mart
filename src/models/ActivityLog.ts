import mongoose, { Schema } from 'mongoose';
import { IActivityLog } from '../interfaces';

const activityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ createdAt: -1 });

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
