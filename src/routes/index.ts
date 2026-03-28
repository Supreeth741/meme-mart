import { Router } from 'express';
import authRoutes from './authRoutes';
import mediaRoutes from './mediaRoutes';
import searchRoutes from './searchRoutes';
import categoryRoutes from './categoryRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/media', mediaRoutes);
router.use('/search', searchRoutes);
router.use('/categories', categoryRoutes);
router.use('/admin', adminRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
