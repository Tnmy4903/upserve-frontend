import { ApiError, apiConfig, apiRequest } from '../../../services/apiClient';
import type { ProjectUpload } from '../types';

async function download(uploadId: string, fileName: string) {
  const token = sessionStorage.getItem('upserve.accessToken');
  const response = await fetch(`${apiConfig.baseUrl}/api/uploads/${uploadId}/download`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!response.ok) throw new ApiError(response.status, response.status === 403 ? 'You do not have access to this file.' : response.status === 404 ? 'File not found.' : 'Unable to download this file.');
  const url = URL.createObjectURL(await response.blob()); const anchor = document.createElement('a'); anchor.href = url; anchor.download = fileName; anchor.click(); URL.revokeObjectURL(url);
}

export async function previewUrl(uploadId: string) {
  const token = sessionStorage.getItem('upserve.accessToken');
  const response = await fetch(`${apiConfig.baseUrl}/api/uploads/${uploadId}/download`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!response.ok) throw new ApiError(response.status, response.status === 403 ? 'You do not have access to this file.' : response.status === 404 ? 'File unavailable.' : 'Unable to preview this file.');
  return URL.createObjectURL(await response.blob());
}

export const uploadApi = {
  list: (projectId: string) => apiRequest<ProjectUpload[]>(`/api/uploads/projects/${projectId}`),
  create: (file: File, projectId: string, clientVisible: boolean) => { const body = new FormData(); body.append('file', file); body.append('projectId', projectId); body.append('clientVisible', String(clientVisible)); return apiRequest<ProjectUpload>('/api/uploads/', { method: 'POST', body }); },
  createWithProgress: (file: File, projectId: string, clientVisible: boolean, onProgress: (percent: number) => void) => new Promise<ProjectUpload>((resolve, reject) => { const body = new FormData(); body.append('file', file); body.append('projectId', projectId); body.append('clientVisible', String(clientVisible)); const request = new XMLHttpRequest(); request.open('POST', `${apiConfig.baseUrl}/api/uploads/`); const token = sessionStorage.getItem('upserve.accessToken'); if (token) request.setRequestHeader('Authorization', `Bearer ${token}`); request.upload.onprogress = event => { if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100)); }; request.onload = () => { let data: unknown = null; try { data = request.responseText ? JSON.parse(request.responseText) : null; } catch { data = request.responseText; } if (request.status === 401) window.dispatchEvent(new Event('upserve:unauthorized')); if (request.status >= 200 && request.status < 300) resolve(data as ProjectUpload); else { const detail = typeof data === 'object' && data && 'detail' in data ? String(data.detail) : 'Unable to upload this file.'; reject(new ApiError(request.status, detail)); } }; request.onerror = () => reject(new ApiError(0, 'Network error while uploading this file.')); request.send(body); }),
  download,
  previewUrl,
  remove: (uploadId: string) => apiRequest<{ message: string }>(`/api/uploads/${uploadId}`, { method: 'DELETE' }),
};
