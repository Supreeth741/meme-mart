import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

// All admin routes require auth + admin role
router.use(authenticate, authorizeAdmin);

router.get('/analytics', AdminController.getAnalytics);
router.get('/traffic', AdminController.getTrafficMetrics);
router.get('/users', AdminController.getAllUsers);
router.get('/users/:userId/activity', AdminController.getUserActivity);
router.get('/users/:userId/uploads', AdminController.getUserUploads);
router.get('/reports', AdminController.getReports);
router.get('/reports/:id', AdminController.getReportById);
router.patch('/reports/:id', AdminController.updateReportStatus);
router.patch('/media/:id/viral', AdminController.toggleViral);
router.delete('/media/:id', AdminController.deleteMedia);

export default router;
