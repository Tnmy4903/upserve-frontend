import { apiRequest } from './apiClient';
import type { LoginResponse, PasswordChange, User, UserLogin } from '../types/auth';

export const authApi = {
  login: (payload: UserLogin) =>
    apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: () => apiRequest<User>('/api/auth/me'),
  changePassword: (payload: PasswordChange) =>
    apiRequest<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createSubAdmin: (payload: { name: string; email: string; phone?: string }) =>
    apiRequest<{ user: User; temporary_password: string }>('/api/auth/create-sub-admin', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateUserStatus: (id: string, isActive: boolean) =>
    apiRequest<User>(`/api/auth/users/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),
  updateProfile: (payload: { name?: string; phone?: string | null }) =>
    apiRequest<User>('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  lookupSubAdmin: (email: string) =>
    apiRequest<User>(`/api/auth/sub-admins/lookup?email=${encodeURIComponent(email)}`),
  getUserIdentity: (id: string) =>
    apiRequest<User>(`/api/auth/users/${encodeURIComponent(id)}`),
};
