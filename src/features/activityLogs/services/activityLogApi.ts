import { apiRequest } from '../../../services/apiClient';
import type { ActivityLog } from '../types';

const query = (skip: number, limit: number) => `?skip=${skip}&limit=${limit}`;

export const activityLogApi = {
  list: (skip = 0, limit = 50) => apiRequest<ActivityLog[]>(`/api/activity-logs${query(skip, limit)}`),
  byUser: (userId: string, skip = 0, limit = 50) => apiRequest<ActivityLog[]>(`/api/activity-logs/user/${encodeURIComponent(userId)}${query(skip, limit)}`),
  byEntity: (entityId: string, entity?: string, skip = 0, limit = 50) => {
    const filter = entity ? `&entity=${encodeURIComponent(entity)}` : '';
    return apiRequest<ActivityLog[]>(`/api/activity-logs/entity/${encodeURIComponent(entityId)}${query(skip, limit)}${filter}`);
  },
  get: (id: string) => apiRequest<ActivityLog>(`/api/activity-logs/${encodeURIComponent(id)}`),
};
