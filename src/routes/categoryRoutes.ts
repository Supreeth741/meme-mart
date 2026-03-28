import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

// Public
router.get('/', CategoryController.getAll);
router.get('/:slug', CategoryController.getBySlug);

// Admin only
router.post('/', authenticate, authorizeAdmin, CategoryController.create);
router.delete('/:slug', authenticate, authorizeAdmin, CategoryController.delete);

export default router;
