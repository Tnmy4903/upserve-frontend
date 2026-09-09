export type InvoiceStatus = 'generated' | 'sent' | 'paid' | 'cancelled';
export type InvoiceStage = 'advance' | 'milestone' | 'final';

export interface Invoice {
  id: string;
  projectId: string;
  clientId: string;
  quotationId?: string | null;
  leadId?: string | null;
  invoiceNumber: string;
  stage: InvoiceStage;
  percentage: number;
  title: string;
  description?: string | null;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  isPaid: boolean;
  paymentAmount?: number | null;
  paymentReference?: string | null;
  paymentMethod?: string | null;
  paidAt?: string | null;
  paidBy?: string | null;
  fileUrl?: string | null;
  downloadUrl?: string | null;
  generatedOn: string;
  dueDate?: string | null;
  paidOn?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentPayload {
  isPaid: true;
  paymentAmount: number;
  paymentReference: string;
  paymentMethod: string;
}
