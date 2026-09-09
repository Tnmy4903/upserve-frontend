import { apiRequest } from '../../../services/apiClient';
import type { Notification } from '../types';

export const notificationApi = {
  list: () => apiRequest<Notification[]>('/api/notifications?skip=0&limit=100'),
  unread: () => apiRequest<Notification[]>('/api/notifications/unread'),
  markRead: (id: string) => apiRequest<Notification>(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' }),
  markAllRead: () => apiRequest<{ message: string }>('/api/notifications/read-all', { method: 'POST' }),
  remove: (id: string) => apiRequest<{ message: string }>(`/api/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  clearAll: () => apiRequest<{ message: string }>('/api/notifications/clear-all', { method: 'POST' }),
};
