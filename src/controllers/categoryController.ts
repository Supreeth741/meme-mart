import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/categoryService';

export class CategoryController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getAll();
      res.json({ status: 'success', data: categories });
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.getBySlug(req.params.slug);
      res.json({ status: 'success', data: category });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.create(req.body.name, req.body.icon);
      res.status(201).json({ status: 'success', data: category });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await CategoryService.delete(req.params.slug);
      res.json({ status: 'success', message: 'Category deleted' });
    } catch (error) {
      next(error);
    }
  }
}
