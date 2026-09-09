import { apiConfig, apiRequest, ApiError } from '../../../services/apiClient';
import type { Requirement, RequirementCreate, RequirementUpdate } from '../types';

const pathId = (id: string) => encodeURIComponent(id);
const requirementPath = (id: string) => `/api/requirements/${pathId(id)}`;

export const requirementApi = {
  create: (payload: RequirementCreate) => apiRequest<Requirement>('/api/requirements', { method: 'POST', body: JSON.stringify(payload) }),
  get: (id: string) => apiRequest<Requirement>(requirementPath(id)),
  update: (id: string, payload: RequirementUpdate) => apiRequest<Requirement>(requirementPath(id), { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string) => apiRequest<{ message: string }>(requirementPath(id), { method: 'DELETE' }),
  approve: (id: string, remarks?: string) => apiRequest<Requirement>(`${requirementPath(id)}/approve`, { method: 'PATCH', body: JSON.stringify({ remarks: remarks || undefined }) }),
  requestChanges: (id: string, remarks?: string) => apiRequest<Requirement>(`${requirementPath(id)}/request-changes`, { method: 'PATCH', body: JSON.stringify({ remarks: remarks || undefined }) }),
  forLead: (leadId: string) => apiRequest<Requirement>(`/api/leads/${pathId(leadId)}/requirements`),
  forProject: (projectId: string) => apiRequest<Requirement>(`/api/projects/${pathId(projectId)}/requirements`),
  uploadAttachment: (id: string, file: File) => { const body = new FormData(); body.append('file', file); return apiRequest<Requirement>(`${requirementPath(id)}/attachment`, { method: 'POST', body }); },
  downloadAttachment: async (id: string, fileName: string) => { const token = sessionStorage.getItem('upserve.accessToken'); const response = await fetch(`${apiConfig.baseUrl}${requirementPath(id)}/attachment`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); if (!response.ok) throw new ApiError(response.status, response.status === 404 ? 'Requirement file was not found.' : 'Unable to download the requirement file.'); const url = URL.createObjectURL(await response.blob()); const anchor = document.createElement('a'); anchor.href = url; anchor.download = fileName; document.body.appendChild(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); },
};
