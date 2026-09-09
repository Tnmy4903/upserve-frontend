import type { FormEvent } from 'react';
import type { Invoice, InvoiceStage } from '../types';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';

export type PaymentDraft = { amount: string; reference: string; method: string };
type InvoiceStageCardProps = {
  invoice: Invoice;
  busy: boolean;
  isSuperAdmin: boolean;
  canCancel: boolean;
  showPayment: boolean;
  payment: PaymentDraft;
  onDownload: (invoice: Invoice) => void;
  onSend: (invoice: Invoice) => void;
  onTogglePayment: (invoice: Invoice) => void;
  onPaymentChange: (payment: PaymentDraft) => void;
  onConfirmPayment: (event: FormEvent<HTMLFormElement>, invoice: Invoice) => void;
};

const date = (value?: string | null) => value ? new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Not set';
const money = (value: number, currency: string) => value.toLocaleString(undefined, { style: 'currency', currency, maximumFractionDigits: 2 });
const stageLabel = (stage: InvoiceStage) => stage === 'advance' ? 'Advance payment' : stage === 'milestone' ? 'Milestone payment' : 'Final payment';

export function InvoiceStageCard({ invoice, busy, isSuperAdmin, canCancel, showPayment, payment, onDownload, onSend, onTogglePayment, onPaymentChange, onConfirmPayment, onCancel }: InvoiceStageCardProps & { onCancel: (invoice: Invoice) => void }) {
  return <article className={`invoice-stage-card ${invoice.isPaid ? 'invoice-stage-card--paid' : ''} ${invoice.status === 'cancelled' ? 'invoice-stage-card--cancelled' : ''}`}><div className="invoice-stage-heading"><div><span className="invoice-number">{invoice.invoiceNumber}</span><h3>{stageLabel(invoice.stage)} <small>{invoice.percentage}%</small></h3><span className="muted">Generated {date(invoice.generatedOn)} · Due {date(invoice.dueDate)}</span></div><InvoiceStatusBadge status={invoice.status} /></div><div className="invoice-stage-main"><strong>{money(invoice.amount, invoice.currency)}</strong><span className={invoice.isPaid ? 'payment-state paid' : 'payment-state'}>{invoice.isPaid ? 'Paid' : invoice.status === 'sent' ? 'Awaiting payment' : invoice.status === 'cancelled' ? 'Cancelled' : 'Not paid'}</span></div>{invoice.isPaid && <div className="payment-confirmation"><strong>Payment received</strong><span>{invoice.paymentMethod || 'Payment recorded'}{invoice.paymentReference ? ` · ${invoice.paymentReference}` : ''}{invoice.paidAt ? ` · ${date(invoice.paidAt)}` : ''}</span></div>}<div className="invoice-actions"><button type="button" className="secondary" disabled={busy} onClick={() => onDownload(invoice)}>Download PDF</button>{isSuperAdmin && invoice.status === 'generated' && <button type="button" disabled={busy} onClick={() => onSend(invoice)}>Send invoice</button>}{isSuperAdmin && invoice.status === 'sent' && !invoice.isPaid && <button type="button" disabled={busy} onClick={() => onTogglePayment(invoice)}>{showPayment ? 'Close payment form' : 'Confirm payment'}</button>}{canCancel && <button type="button" className="secondary danger-action" disabled={busy} onClick={() => onCancel(invoice)}>Cancel invoice</button>}</div>{showPayment && isSuperAdmin && <form className="payment-form" onSubmit={event => onConfirmPayment(event, invoice)}><div><h4>Confirm {stageLabel(invoice.stage).toLowerCase()}</h4><p className="field-help">Payment must match {money(invoice.amount, invoice.currency)} exactly.</p></div><label>Payment amount<input type="number" min="0.01" step="0.01" value={payment.amount} onChange={event => onPaymentChange({ ...payment, amount: event.target.value })} required /></label><label>Payment reference<input value={payment.reference} onChange={event => onPaymentChange({ ...payment, reference: event.target.value })} required /></label><label>Payment method<input value={payment.method} onChange={event => onPaymentChange({ ...payment, method: event.target.value })} placeholder="Bank transfer, cash, UPI…" required /></label><div className="form-actions"><button type="submit" disabled={busy}>{busy ? 'Confirming…' : 'Confirm payment'}</button><button type="button" className="secondary" onClick={() => onTogglePayment(invoice)}>Cancel</button></div></form>}</article>;
}
