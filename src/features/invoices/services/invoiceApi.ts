import { ApiError, apiConfig, apiRequest } from '../../../services/apiClient';
import type { Invoice, PaymentPayload } from '../types';

const idPath = (id: string) => encodeURIComponent(id);

async function download(invoiceId: string, invoiceNumber: string) {
  const token = sessionStorage.getItem('upserve.accessToken');
  const response = await fetch(`${apiConfig.baseUrl}/api/invoices/${idPath(invoiceId)}/download`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!response.ok) throw new ApiError(response.status, response.status === 403 ? 'You do not have access to this invoice.' : response.status === 404 ? 'Invoice PDF was not found.' : 'Unable to download the invoice PDF.');
  const url = URL.createObjectURL(await response.blob()); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `invoice_${invoiceNumber}.pdf`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const invoiceApi = {
  getAllByProject: (projectId: string) => apiRequest<Invoice[]>(`/api/invoices/project/${idPath(projectId)}/all`),
  get: (invoiceId: string) => apiRequest<Invoice>(`/api/invoices/${idPath(invoiceId)}`),
  send: (invoiceId: string) => apiRequest<{ message: string; email: string }>(`/api/invoices/${idPath(invoiceId)}/send`, { method: 'POST' }),
  confirmPayment: (invoiceId: string, payload: PaymentPayload) => apiRequest<{ message: string }>(`/api/invoices/${idPath(invoiceId)}/payment`, { method: 'PATCH', body: JSON.stringify(payload) }),
  cancel: (invoiceId: string) => apiRequest<Invoice>(`/api/invoices/${idPath(invoiceId)}/cancel`, { method: 'POST' }),
  reconcileSend: (invoiceId: string) => apiRequest<Invoice>(`/api/invoices/${idPath(invoiceId)}/reconcile-send`, { method: 'POST' }),
  download,
};
