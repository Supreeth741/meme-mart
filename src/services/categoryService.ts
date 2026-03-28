import Category from '../models/Category';
import { AppError } from '../middleware/errorHandler';

export class CategoryService {
  static async getAll() {
    return Category.find().sort({ name: 1 }).lean();
  }

  static async getBySlug(slug: string) {
    const category = await Category.findOne({ slug });
    if (!category) throw new AppError('Category not found', 404);
    return category;
  }

  static async create(name: string, icon?: string) {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const existing = await Category.findOne({ slug });
    if (existing) throw new AppError('Category already exists', 400);

    return Category.create({ name, slug, icon });
  }

  static async delete(slug: string) {
    const result = await Category.findOneAndDelete({ slug });
    if (!result) throw new AppError('Category not found', 404);
    return result;
  }
}
