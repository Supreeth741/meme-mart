import User from '../models/User';
import Media from '../models/Media';
import Report from '../models/Report';
import ActivityLog from '../models/ActivityLog';
import { AnalyticsData } from '../interfaces';

export class AdminService {
  static async getAnalytics(): Promise<AnalyticsData> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalMedia,
      downloadStats,
      viewStats,
      mediaByType,
      recentUploads,
      recentUsers,
      topMedia,
      uploadTrend,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Media.countDocuments(),
      Media.aggregate([{ $group: { _id: null, total: { $sum: '$downloads' } } }]),
      Media.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      Media.aggregate([{ $group: { _id: '$mediaType', count: { $sum: 1 } } }]),
      Media.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Media.find().sort({ views: -1 }).limit(10).lean(),
      Media.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      totalUsers,
      totalMedia,
      totalDownloads: downloadStats[0]?.total || 0,
      totalViews: viewStats[0]?.total || 0,
      mediaByType,
      recentUploads,
      recentUsers,
      topMedia: topMedia as any,
      uploadTrend,
    };
  }

  static async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find({ role: 'user' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ role: 'user' }),
    ]);

    return {
      data: users,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getUserActivity(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      ActivityLog.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments({ userId }),
    ]);

    return {
      data: logs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getUserUploads(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [uploads, total] = await Promise.all([
      Media.find({ uploadedBy: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments({ uploadedBy: userId }),
    ]);

    return {
      data: uploads,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getReports(status?: string, page: number = 1, limit: number = 10) {
    const filter: any = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(filter),
    ]);

    return {
      data: reports,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getReportById(reportId: string) {
    const report = await Report.findById(reportId).lean();
    if (!report) throw new Error('Report not found');
    return report;
  }

  static async updateReportStatus(reportId: string, status: string) {
    const report = await Report.findByIdAndUpdate(
      reportId,
      { status },
      { new: true }
    );
    if (!report) throw new Error('Report not found');
    return report;
  }

  static async getTrafficMetrics() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [loginActivity, uploadActivity] = await Promise.all([
      ActivityLog.aggregate([
        {
          $match: {
            action: 'login',
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      ActivityLog.aggregate([
        {
          $match: {
            action: 'upload',
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return { loginActivity, uploadActivity };
  }
}
