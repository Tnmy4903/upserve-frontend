import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ApiError } from '../../../services/apiClient';
import { QuotationForm } from '../components/QuotationForm';
import { quotationApi } from '../services/quotationApi';
import { leadApi } from '../../leads/services/leadApi';
import { LeadTable } from '../../leads/components/LeadTable';
import type { QuotationFormValues, QuotationPayload } from '../types';
import type { Lead } from '../../leads/types';

export function QuotationCreatePage() {
  const navigate = useNavigate(); const [params] = useSearchParams(); const selectedLeadId = params.get('leadId') || undefined; const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [leads, setLeads] = useState<Lead[]>([]); const [loadingLeads, setLoadingLeads] = useState(true);
  useEffect(() => { leadApi.list({ skip: 0, limit: 100 }).then(setLeads).catch(value => setError(message(value))).finally(() => setLoadingLeads(false)); }, []);
  const message = (value: unknown) => value instanceof ApiError ? value.message : value instanceof Error ? value.message : 'Unable to create quotation.';
  async function submit(values: QuotationFormValues) {
    if (values.leadId.trim() === '') { setError('Select a lead before creating the quotation.'); return; }
    setBusy(true); setError('');
    try {
      const lead = values.leadId.trim() ? await leadApi.get(values.leadId.trim()) : null;
      if (lead && !lead.clientId) { setError('This lead is not linked to a client account yet.'); return; }
      const payload: QuotationPayload = { clientId: lead?.clientId || '', leadId: lead?.id, services: values.items.map(item => item.service.trim()), items: values.items.map(item => { const quantity = Number(item.quantity); const unitPrice = Number(item.price); return { description: item.description.trim(), quantity, unitPrice, total: quantity * unitPrice }; }), timeline: values.timeline.trim(), validity: Number(values.validity), terms: values.terms.trim(), notes: values.notes.trim() || undefined };
      const quotation = await quotationApi.create(payload); navigate(`/app/quotations/${quotation.id}`);
    } catch (value) { setError(message(value)); } finally { setBusy(false); }
  }
  const selectedLead = selectedLeadId ? leads.find(lead => lead.id === selectedLeadId) : undefined;
  return <section className="page quotations-page"><Link className="back-link" to="/app/quotations"><ArrowLeft size={16} aria-hidden="true" /> Quotations</Link><div className="page-heading"><div><p className="eyebrow">Commercial workspace</p><h1>{selectedLeadId ? 'Create quotation' : 'Choose a lead'}</h1><p className="muted">{selectedLeadId ? 'Create a proposal from this qualified lead. Requirement context can be added separately by the client.' : 'Start with the lead that should receive a proposal. A requirement is optional.'}</p></div></div>{error && <div className="error" role="alert">{error}</div>}{loadingLeads ? <div className="card screen-state">Loading available leads…</div> : selectedLeadId && !selectedLead ? <div className="card screen-state"><h2>Lead not found</h2><p className="muted">This quotation link is no longer valid. Return to the pipeline and choose a lead again.</p><Link className="button-link" to="/app/quotations">Back to quotations</Link></div> : selectedLead ? <QuotationForm leads={leads} selectedLeadId={selectedLeadId} busy={busy} onSubmit={payload => void submit(payload as QuotationFormValues)} onCancel={() => navigate('/app/quotations')} /> : <div className="card quotation-lead-entry"><div className="section-heading"><div><h2>Start from a lead</h2><p className="muted">No technical ID is needed. Select a lead to continue.</p></div></div><LeadTable leads={leads} createPath="quotations" /></div>}</section>;
}
