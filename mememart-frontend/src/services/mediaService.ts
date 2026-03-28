import api from './api';

export const mediaService = {
  getLatest: (mediaType?: string, limit?: number) =>
    api.get('/media/latest', { params: { mediaType, limit } }),

  getTrending: (limit?: number) =>
    api.get('/media/trending', { params: { limit } }),

  getById: (id: string) => api.get(`/media/${id}`),

  getRelated: (id: string, limit?: number) =>
    api.get(`/media/${id}/related`, { params: { limit } }),

  getByCategory: (slug: string, page?: number, limit?: number) =>
    api.get(`/media/category/${slug}`, { params: { page, limit } }),

  getUserUploads: (page?: number, limit?: number) =>
    api.get('/media/user/uploads', { params: { page, limit } }),

  upload: (formData: FormData) =>
    api.post('/media/upload', formData),

  download: (id: string) => api.post(`/media/${id}/download`),

  deleteMedia: (id: string) => api.delete(`/media/${id}`),

  report: (id: string, reason: string, description?: string) =>
    api.post(`/media/${id}/report`, { reason, description }),

  search: (params: {
    q?: string;
    category?: string;
    mediaType?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) => api.get('/search', { params }),
};
