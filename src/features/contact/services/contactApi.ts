import { apiRequest } from '../../../services/apiClient';

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  business?: string;
  message: string;
}

export const contactApi = {
  submit: (data: ContactRequest) => apiRequest<Record<string, unknown>>('/api/public/contact', { method: 'POST', body: JSON.stringify(data) }),
};
