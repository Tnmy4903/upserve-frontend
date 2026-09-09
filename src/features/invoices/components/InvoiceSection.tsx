import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ApiError } from '../../../services/apiClient';
import { projectApi } from '../../projects/services/projectApi';
import type { PaymentSchedule, ProjectInvoiceSchedule } from '../../projects/types';
import { invoiceApi } from '../services/invoiceApi';
import type { Invoice, InvoiceStage, PaymentPayload } from '../types';
import { InvoiceSchedule } from './InvoiceSchedule';
import { InvoiceStageCard, type PaymentDraft } from './InvoiceStageCard';
import { InvoiceSummary } from './InvoiceSummary';
import { useConfirm } from '../../../components/ui';

const errorMessage = (error: unknown) => error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Unable to complete the invoice request.';
const stageLabel = (stage: InvoiceStage) => stage === 'advance' ? 'Advance payment' : stage === 'milestone' ? 'Milestone payment' : 'Final payment';
const stageOrder: InvoiceStage[] = ['advance', 'milestone', 'final'];

type InvoiceSectionProps = { projectId: string; projectStatus: string; projectDeadline?: string | null; projectValue?: number | null; invoiceSchedule?: ProjectInvoiceSchedule[]; paymentSchedule?: PaymentSchedule };

export function InvoiceSection({ projectId, projectStatus, projectDeadline, projectValue, invoiceSchedule, paymentSchedule }: InvoiceSectionProps) {
  const { user } = useAuth();
  const isClient = user?.role === 'client';
  const isSuperAdmin = user?.role === 'super_admin';
  const canEditProject = isSuperAdmin;
  const canGenerate = isSuperAdmin && projectStatus !== 'completed';
  const confirm = useConfirm();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState(projectDeadline ? projectDeadline.slice(0, 10) : '');
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentDraft>({ amount: '', reference: '', method: '' });
  const [scheduleForm, setScheduleForm] = useState<PaymentSchedule | null>(paymentSchedule || null);

  async function refresh() {
    setLoading(true); setError('');
    try { setInvoices(await invoiceApi.getAllByProject(projectId)); }
    catch (value) { if (value instanceof ApiError && value.status === 404) setInvoices([]); else setError(errorMessage(value)); }
    finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, [projectId]);
  useEffect(() => { setScheduleForm(paymentSchedule || null); }, [paymentSchedule]);

  const activeInvoices = useMemo(() => invoices.filter(invoice => invoice.status !== 'cancelled'), [invoices]);
  const totalValue = projectValue ?? (activeInvoices.length ? activeInvoices.reduce((sum, invoice) => sum + invoice.amount, 0) : 0);
  const totalPaid = useMemo(() => activeInvoices.filter(invoice => invoice.isPaid).reduce((sum, invoice) => sum + (invoice.paymentAmount ?? invoice.amount), 0), [activeInvoices]);
  const outstanding = Math.max(0, totalValue - totalPaid);
  const activeSchedule = scheduleForm || paymentSchedule;
  const schedule = activeSchedule ? stageOrder.map((stage, index) => { const percentage = [activeSchedule.advancePercentage, activeSchedule.milestonePercentage, activeSchedule.finalPercentage][index]; const invoice = activeInvoices.find(item => item.stage === stage); return { stage, percentage, amount: Math.round(totalValue * percentage / 100 * 100) / 100, invoiceId: invoice?.id, status: invoice?.status || 'not_generated', isPaid: Boolean(invoice?.isPaid) }; }).filter(item => item.percentage > 0) : [];
  const nextStageItem = schedule.find(item => !item.invoiceId);
  const blockingStage = nextStageItem && schedule.some(item => item.stage !== nextStageItem.stage && stageOrder.indexOf(item.stage) < stageOrder.indexOf(nextStageItem.stage) && item.invoiceId && !item.isPaid)
    ? schedule.find(item => stageOrder.indexOf(item.stage) < stageOrder.indexOf(nextStageItem.stage) && item.invoiceId && !item.isPaid)
    : undefined;
  const nextStage = blockingStage ? undefined : nextStageItem?.stage;

  async function generate() {
    if (!nextStage) return;
    setBusy(true); setError(''); setNotice('');
    try { const created = await projectApi.generateInvoice(projectId, invoiceDueDate || undefined, nextStage); setInvoices(previous => [...previous.filter(invoice => invoice.stage !== created.stage), created].sort((a, b) => stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage))); setNotice(`${stageLabel(created.stage)} invoice generated.`); }
    catch (value) { setError(errorMessage(value)); }
    finally { setBusy(false); }
  }

  async function saveSchedule() {
    if (!scheduleForm) return;
    const values = [scheduleForm.advancePercentage, scheduleForm.milestonePercentage, scheduleForm.finalPercentage];
    if (values.some(value => !Number.isFinite(value) || value < 0) || Math.abs(values.reduce((sum, value) => sum + value, 0) - 100) > 1e-9) { setError('Percentages cannot be negative and the total must equal 100%.'); return; }
    await operation(() => projectApi.updatePaymentSchedule(projectId, scheduleForm), 'Payment schedule updated successfully.');
  }

  async function operation(request: () => Promise<unknown>, success: string): Promise<boolean> {
    setBusy(true); setError(''); setNotice('');
    try { await request(); setNotice(success); await refresh(); return true; }
    catch (value) { setError(errorMessage(value)); return false; }
    finally { setBusy(false); }
  }

  async function send(invoice: Invoice) {
    if (await confirm({ title: 'Send invoice', message: `This will email the ${stageLabel(invoice.stage).toLowerCase()} invoice to the client.` })) void operation(() => invoiceApi.send(invoice.id), 'Invoice sent successfully.');
  }
  async function cancel(invoice: Invoice) {
    if (invoice.isPaid || !['generated', 'sent'].includes(invoice.status)) return;
    if (await confirm({ title: 'Cancel invoice', message: `This will cancel the unpaid ${stageLabel(invoice.stage).toLowerCase()} invoice. It can no longer be paid and the stage may be generated again.`, destructive: true })) void operation(() => invoiceApi.cancel(invoice.id), 'Invoice cancelled.');
  }
  function togglePayment(invoice: Invoice) {
    setPayment({ amount: String(invoice.amount), reference: '', method: '' });
    setShowPayment(showPayment === invoice.id ? null : invoice.id);
  }
  async function confirmPayment(event: FormEvent<HTMLFormElement>, invoice: Invoice) {
    event.preventDefault();
    const amount = Number(payment.amount);
    if (!Number.isFinite(amount) || amount <= 0 || !payment.reference.trim() || !payment.method.trim()) { setError('Enter the exact invoice amount, payment reference and payment method.'); return; }
    if (!(await confirm({ title: 'Confirm payment', message: `This records a payment of ${invoice.amount} as paid.`, destructive: true })) ) return;
    const payload: PaymentPayload = { isPaid: true, paymentAmount: amount, paymentReference: payment.reference.trim(), paymentMethod: payment.method.trim() };
    const successful = await operation(() => invoiceApi.confirmPayment(invoice.id, payload), 'Payment confirmed successfully.');
    if (successful) { setShowPayment(null); setPayment({ amount: '', reference: '', method: '' }); }
  }
  async function download(invoice: Invoice) {
    setError('');
    try { await invoiceApi.download(invoice.id, invoice.invoiceNumber); }
    catch (value) { setError(errorMessage(value)); }
  }

  return <section className="card phase8-section invoice-section"><div className="section-heading phase8-heading"><div><p className="eyebrow">Commercial record</p><h2>Payment schedule</h2><p className="muted">Track the agreed project value across advance, milestone and final payments.</p></div></div>{error && <div className="error" role="alert">{error}</div>}{notice && <div className="success" role="status">{notice}</div>}{loading ? <div className="section-loading">Loading payment schedule…</div> : <>
    {canEditProject && scheduleForm && <div className="invoice-generation-form"><h3>Configure payment split</h3><p className="field-help">Available until the first invoice is generated. Percentages may be 0%, but the total must equal 100%.</p><label>Advance (%)<input type="number" min="0" step="0.01" value={scheduleForm.advancePercentage} disabled={busy || activeInvoices.length > 0} onChange={event => setScheduleForm({ ...scheduleForm, advancePercentage: Number(event.target.value) })} /></label><label>Milestone (%)<input type="number" min="0" step="0.01" value={scheduleForm.milestonePercentage} disabled={busy || activeInvoices.length > 0} onChange={event => setScheduleForm({ ...scheduleForm, milestonePercentage: Number(event.target.value) })} /></label><label>Final (%)<input type="number" min="0" step="0.01" value={scheduleForm.finalPercentage} disabled={busy || activeInvoices.length > 0} onChange={event => setScheduleForm({ ...scheduleForm, finalPercentage: Number(event.target.value) })} /></label><p className="field-help">Total: {scheduleForm.advancePercentage + scheduleForm.milestonePercentage + scheduleForm.finalPercentage}%</p>{activeInvoices.length === 0 && <button disabled={busy} onClick={() => void saveSchedule()}>Save payment schedule</button>}</div>}
    {totalValue > 0 && <InvoiceSummary totalValue={totalValue} totalPaid={totalPaid} outstanding={outstanding} currency={activeInvoices[0]?.currency || 'INR'} />}
    {schedule.length > 0 && <InvoiceSchedule schedule={schedule} currency={activeInvoices[0]?.currency || 'INR'} />}
    {invoices.length === 0 && <div className="empty-state invoice-empty"><h3>No invoice generated yet.</h3><p>{canGenerate && nextStage ? `Generate the ${stageLabel(nextStage).toLowerCase()} to begin the project payment schedule.` : isClient ? 'Your payment schedule will appear here when an invoice is generated.' : 'Payment details will appear here once the Super Admin generates the next payment invoice.'}</p>{canGenerate && nextStage && <div className="invoice-generation-form"><label>Invoice due date<span className="field-help">Optional. Defaults to the project deadline.</span><input type="date" value={invoiceDueDate} onChange={event => setInvoiceDueDate(event.target.value)} /></label><button disabled={busy} onClick={() => void generate()}>{busy ? 'Generating…' : `Generate ${stageLabel(nextStage).toLowerCase()}`}</button></div>}</div>}
    {invoices.length > 0 && <div className="invoice-stage-list">{invoices.map(invoice => <InvoiceStageCard key={invoice.id} invoice={invoice} busy={busy} isSuperAdmin={isSuperAdmin} canCancel={isSuperAdmin && !invoice.isPaid && ['generated', 'sent'].includes(invoice.status)} showPayment={showPayment === invoice.id} payment={payment} onDownload={download} onSend={send} onTogglePayment={togglePayment} onPaymentChange={setPayment} onConfirmPayment={confirmPayment} onCancel={cancel} />)}</div>}
    {canGenerate && activeInvoices.length > 0 && (nextStage || blockingStage) && <div className="invoice-next-stage"><div><h3>{blockingStage ? 'Payment required before next stage' : 'Next payment stage'}</h3><p className="muted">{blockingStage ? `${stageLabel(blockingStage.stage)} must be marked as paid before ${stageLabel(nextStageItem!.stage).toLowerCase()} can be generated.` : `${stageLabel(nextStage!)} is ready to be generated.`}</p></div>{nextStage && <div className="invoice-generation-form"><label>Due date<input type="date" value={invoiceDueDate} onChange={event => setInvoiceDueDate(event.target.value)} /></label><button disabled={busy} onClick={() => void generate()}>{busy ? 'Generating…' : `Generate ${stageLabel(nextStage).toLowerCase()} invoice`}</button></div>}</div>}
  </>}</section>;
}
