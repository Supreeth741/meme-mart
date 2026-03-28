import api from './api';

export const adminService = {
  getAnalytics: () => api.get('/admin/analytics'),
  getTrafficMetrics: () => api.get('/admin/traffic'),
  getAllUsers: (page?: number, limit?: number) =>
    api.get('/admin/users', { params: { page, limit } }),
  getUserActivity: (userId: string, page?: number, limit?: number) =>
    api.get(`/admin/users/${userId}/activity`, { params: { page, limit } }),
  getUserUploads: (userId: string, page?: number, limit?: number) =>
    api.get(`/admin/users/${userId}/uploads`, { params: { page, limit } }),
  getReports: (status?: string, page?: number, limit?: number) =>
    api.get('/admin/reports', { params: { status, page, limit } }),
  getReportById: (reportId: string) => api.get(`/admin/reports/${reportId}`),
  updateReportStatus: (reportId: string, status: string) =>
    api.patch(`/admin/reports/${reportId}`, { status }),
  toggleViral: (mediaId: string) => api.patch(`/admin/media/${mediaId}/viral`),
  deleteMedia: (mediaId: string) => api.delete(`/admin/media/${mediaId}`),
};
