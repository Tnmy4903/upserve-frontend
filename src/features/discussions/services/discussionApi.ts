import { apiRequest } from '../../../services/apiClient';
import type { DiscussionMessage } from '../types';

const id = (value: string) => encodeURIComponent(value);

export const discussionApi = {
  list: (projectId: string) => apiRequest<DiscussionMessage[]>(`/api/projects/${id(projectId)}/discussions`),
  create: (projectId: string, message: string) => apiRequest<DiscussionMessage>(`/api/projects/${id(projectId)}/discussions`, { method: 'POST', body: JSON.stringify({ message }) }),
  reply: (messageId: string, message: string) => apiRequest<{ message: string }>(`/api/discussions/${id(messageId)}/replies`, { method: 'POST', body: JSON.stringify({ message }) }),
  remove: (messageId: string) => apiRequest<{ message: string }>(`/api/discussions/${id(messageId)}`, { method: 'DELETE' }),
};
