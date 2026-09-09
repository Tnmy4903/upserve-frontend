import type { InvoiceStatus } from '../types';
import { Check, Clock3, Send, X } from 'lucide-react';

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const Icon = status === 'paid' ? Check : status === 'cancelled' ? X : status === 'sent' ? Send : Clock3;
  return <span className={`invoice-status-badge invoice-status-${status}`}><Icon size={12} aria-hidden="true" />{status.replace('_', ' ')}</span>;
}
