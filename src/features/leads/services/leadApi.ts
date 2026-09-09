import { apiRequest } from '../../../services/apiClient';
import type { Lead, LeadCreate, LeadHistoryEvent, LeadStage, LeadUpdate } from '../types';

const idPath = (id: string) => encodeURIComponent(id);

export const leadApi = {
  list: (params: { skip: number; limit: number; stage?: LeadStage }) => {
    const query = new URLSearchParams({ skip: String(params.skip), limit: String(params.limit) });
    if (params.stage) query.set('stage', params.stage);
    return apiRequest<Lead[]>(`/api/leads?${query.toString()}`);
  },
  get: (id: string) => apiRequest<Lead>(`/api/leads/${idPath(id)}`),
  create: (payload: LeadCreate) => apiRequest<Lead>('/api/leads', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: LeadUpdate) => apiRequest<Lead>(`/api/leads/${idPath(id)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  assign: (id: string, subAdminId: string) => apiRequest<Lead>(`/api/leads/${idPath(id)}/assign/${idPath(subAdminId)}`, { method: 'POST' }),
  history: (id: string) => apiRequest<LeadHistoryEvent[]>(`/api/leads/${idPath(id)}/history`),
  markWon: (id: string) => apiRequest<Lead>(`/api/leads/${idPath(id)}/won`, { method: 'POST' }),
  markLost: (id: string) => apiRequest<Lead>(`/api/leads/${idPath(id)}/lost`, { method: 'POST' }),
  convert: (id: string, password?: string) => apiRequest<Lead>(`/api/leads/${idPath(id)}/convert-to-client`, { method: 'POST', body: JSON.stringify({ password: password || undefined }) }),
};
