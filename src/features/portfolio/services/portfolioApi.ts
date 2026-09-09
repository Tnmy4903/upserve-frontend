import { apiRequest } from '../../../services/apiClient';
import type { ContentRecord } from '../../../types/content';

export const portfolioApi = {
  listPublic: () => apiRequest<ContentRecord[]>('/api/portfolio/public'),
  listFeatured: () => apiRequest<ContentRecord[]>('/api/portfolio/featured'),
  getBySlug: (slug: string) => apiRequest<ContentRecord>(`/api/portfolio/${encodeURIComponent(slug)}`),
  listAll: () => apiRequest<ContentRecord[]>('/api/portfolio-admin/all'),
  create: (data: ContentRecord) => apiRequest<ContentRecord>('/api/portfolio', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: ContentRecord) => apiRequest<ContentRecord>(`/api/portfolio-admin/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => apiRequest<{ message: string }>(`/api/portfolio-admin/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
