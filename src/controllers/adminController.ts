import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/adminService';
import { MediaService } from '../services/mediaService';

export class AdminController {
  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await AdminService.getAnalytics();
      res.json({ status: 'success', data: analytics });
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await AdminService.getAllUsers(
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 10
      );
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getUserActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await AdminService.getUserActivity(
        req.params.userId,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 20
      );
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getUserUploads(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await AdminService.getUserUploads(
        req.params.userId,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 10
      );
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getReports(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;
      const result = await AdminService.getReports(
        status as string,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 10
      );
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getReportById(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await AdminService.getReportById(req.params.id);
      res.json({ status: 'success', data: report });
    } catch (error) {
      next(error);
    }
  }

  static async updateReportStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await AdminService.updateReportStatus(req.params.id, req.body.status);
      res.json({ status: 'success', data: report });
    } catch (error) {
      next(error);
    }
  }

  static async getTrafficMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await AdminService.getTrafficMetrics();
      res.json({ status: 'success', data: metrics });
    } catch (error) {
      next(error);
    }
  }

  static async toggleViral(req: Request, res: Response, next: NextFunction) {
    try {
      const media = await MediaService.toggleViral(req.params.id);
      res.json({ status: 'success', data: media });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMedia(req: Request, res: Response, next: NextFunction) {
    try {
      await MediaService.deleteMedia(req.params.id, req.userId!, true);
      res.json({ status: 'success', message: 'Media deleted by admin' });
    } catch (error) {
      next(error);
    }
  }
}
