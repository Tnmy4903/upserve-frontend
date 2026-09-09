import { apiRequest } from '../../../services/apiClient';
import type { TimelineEvent, TimelineEventPayload } from '../types';

const id = (value: string) => encodeURIComponent(value);

export const timelineApi = {
  list: (projectId: string) => apiRequest<TimelineEvent[]>(`/api/projects/${id(projectId)}/timeline`),
  create: (projectId: string, payload: TimelineEventPayload) => apiRequest<TimelineEvent>(`/api/projects/${id(projectId)}/timeline`, { method: 'POST', body: JSON.stringify(payload) }),
  remove: (eventId: string) => apiRequest<{ message: string }>(`/api/timeline/${id(eventId)}`, { method: 'DELETE' }),
};
