const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = configuredApiBaseUrl?.replace(/\/$/, '');

export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const token = sessionStorage.getItem('upserve.accessToken');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, {...options, headers});
  const raw = await response.text();
  let data: unknown = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  if (response.status === 401) window.dispatchEvent(new Event('upserve:unauthorized'));
  if (!response.ok) {
    const detail = typeof data === 'object' && data && 'detail' in data ? String(data.detail) : 'Request failed.';
    throw new ApiError(response.status, detail);
  }
  return data as T;
}
export const apiConfig = { baseUrl: API_BASE_URL };
