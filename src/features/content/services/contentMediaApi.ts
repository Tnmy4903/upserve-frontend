import { apiRequest } from '../../../services/apiClient';

export interface ContentMediaResponse {
  id: string;
  url: string;
  fileName: string;
  contentType: string;
  fileSize: number;
}

export const contentMediaApi = {
  upload: (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return apiRequest<ContentMediaResponse>('/api/content/media', { method: 'POST', body });
  },
};
