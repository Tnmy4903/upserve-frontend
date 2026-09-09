import type { InvoiceStage } from '../types';
import type { ProjectInvoiceSchedule } from '../../projects/types';
import { Check, CircleDotDashed, Minus } from 'lucide-react';

type InvoiceScheduleProps = { schedule: ProjectInvoiceSchedule[]; currency: string };
const stageLabel = (stage: InvoiceStage) => stage === 'advance' ? 'Advance payment' : stage === 'milestone' ? 'Milestone payment' : 'Final payment';
const money = (value: number, currency: string) => value.toLocaleString(undefined, { style: 'currency', currency, maximumFractionDigits: 2 });

export function InvoiceSchedule({ schedule, currency }: InvoiceScheduleProps) {
  return <div className="invoice-schedule"><div className="section-heading"><div><h3>Payment schedule</h3><span className="muted">Commercial value split from the accepted quotation.</span></div></div>{schedule.map(item => <div className="invoice-schedule-row" key={item.stage}><span className={`schedule-check ${item.isPaid ? 'complete' : ''}`} aria-label={item.isPaid ? 'Paid' : item.invoiceId ? 'Invoice generated' : 'Not generated'}>{item.isPaid ? <Check size={12} aria-hidden="true" /> : item.invoiceId ? <CircleDotDashed size={12} aria-hidden="true" /> : <Minus size={12} aria-hidden="true" />}</span><div><strong>{stageLabel(item.stage as InvoiceStage)}</strong><span className="muted">{item.percentage}% · {item.invoiceId ? item.status.replace('_', ' ') : 'Not generated'}</span></div><strong>{money(item.amount, currency)}</strong></div>)}</div>;
}
