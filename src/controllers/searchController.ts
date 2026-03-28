import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/searchService';

export class SearchController {
  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SearchService.search({
        q: req.query.q as string,
        category: req.query.category as string,
        mediaType: req.query.mediaType as any,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        sort: req.query.sort as string,
      });

      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}
