import Report from '../models/Report';
import ActivityLog from '../models/ActivityLog';
import { AppError } from '../middleware/errorHandler';

export class ReportService {
  static async create(mediaId: string, reportedBy: string, reason: string, description?: string) {
    // Prevent duplicate reports
    const existing = await Report.findOne({ mediaId, reportedBy });
    if (existing) throw new AppError('You have already reported this media', 400);

    const report = await Report.create({
      mediaId,
      reportedBy,
      reason,
      description,
    });

    await ActivityLog.create({
      userId: reportedBy,
      action: 'report',
      details: `Reported media ${mediaId}: ${reason}`,
    });

    return report;
  }
}
