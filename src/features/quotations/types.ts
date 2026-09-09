export const quotationStatuses = ['Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Revision Requested', 'Expired'] as const;
export type QuotationStatus = (typeof quotationStatuses)[number];
export interface QuotationItem { description: string; quantity: number; unitPrice: number; total: number; }
export interface Quotation { id: string; quotationNumber: string; clientId: string; clientName?: string | null; projectTitle?: string | null; leadId?: string | null; projectId?: string | null; services: string[]; items: QuotationItem[]; timeline: string; validity: number; terms: string; notes?: string | null; status: QuotationStatus; totalAmount: number; createdAt: string; updatedAt: string; revisionCount: number; lastRevisedBy?: string | null; lastRevisedAt?: string | null; }
export interface QuotationPayload { clientId: string; leadId?: string; projectId?: string; services: string[]; items: QuotationItem[]; timeline: string; validity: number; terms: string; notes?: string; }
export interface QuotationFormItem { service: string; description: string; quantity: string; price: string; }
export interface QuotationFormValues { leadId: string; clientId: string; items: QuotationFormItem[]; timeline: string; validity: string; terms: string; notes: string; }
export type QuotationUpdate = Omit<QuotationPayload, 'clientId' | 'leadId' | 'projectId'>;
export interface QuotationAcceptance { quotation: Quotation; project: Record<string, unknown>; }
