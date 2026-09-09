import { apiRequest } from '../../../services/apiClient';
import type { ContentRecord } from '../../../types/content';

export interface CreateBlogRequest {
  title: string;
  slug: string;
  content: string;
  thumbnail?: string;
}

export const blogApi = {
  list: () => apiRequest<ContentRecord[]>('/api/blogs/'),
  getBySlug: (slug: string) => apiRequest<ContentRecord>(`/api/blogs/${encodeURIComponent(slug)}`),
  create: (data: CreateBlogRequest) => apiRequest<ContentRecord>('/api/blogs/', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id: string) => apiRequest<{ message: string }>(`/api/blogs/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
