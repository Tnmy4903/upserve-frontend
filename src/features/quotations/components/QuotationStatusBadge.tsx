import type { QuotationStatus } from '../types';
import { Check, Clock3, Pencil, Send, TriangleAlert, X } from 'lucide-react';
export function QuotationStatusBadge({ status }: { status: QuotationStatus }) { const Icon = status === 'Accepted' ? Check : status === 'Rejected' ? X : status === 'Revision Requested' ? TriangleAlert : status === 'Sent' ? Send : status === 'Draft' ? Pencil : Clock3; return <span className={`quotation-status quotation-status-${status.toLowerCase().replace(/\s+/g, '-')}`}><Icon size={12} aria-hidden="true" />{status}</span>; }
