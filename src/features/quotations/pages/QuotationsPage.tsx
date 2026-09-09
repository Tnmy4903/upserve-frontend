import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { UserIdentity } from '../../../components/UserIdentity';
import { ResponsiveRecordCard } from '../../../components/ResponsiveRecordCard';
import { useAuth } from '../../../context/AuthContext';
import { ApiError } from '../../../services/apiClient';
import { QuotationStatusBadge } from '../components/QuotationStatusBadge';
import { quotationApi } from '../services/quotationApi';
import type { Quotation, QuotationStatus } from '../types';
import { leadApi } from '../../leads/services/leadApi';
import { LeadTable } from '../../leads/components/LeadTable';
import type { Lead } from '../../leads/types';

const message = (value: unknown) => value instanceof ApiError ? value.message : value instanceof Error ? value.message : 'Unable to load quotations.';
const date = (value: string) => new Date(value).toLocaleDateString();
const money = (value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const statuses: QuotationStatus[] = ['Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Revision Requested', 'Expired'];
const nextAction = (status: QuotationStatus) => ({ Draft: 'Review and send', Sent: 'Awaiting client', Viewed: 'Awaiting decision', Accepted: 'Open project', Rejected: 'Review outcome', 'Revision Requested': 'Review revision', Expired: 'Create a new quote' })[status];

export function QuotationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Quotation[]>([]);
  const [status, setStatus] = useState<QuotationStatus | ''>('');
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [downloadingId, setDownloadingId] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const limit = 25;

  useEffect(() => { setLoading(true); setError(''); quotationApi.list({ skip, limit, ...(status ? { status } : {}) }).then(setItems).catch(value => setError(message(value))).finally(() => setLoading(false)); }, [skip, status]);
  useEffect(() => { if (user?.role === 'client') return; setLoadingLeads(true); leadApi.list({ skip: 0, limit: 100 }).then(setLeads).catch(value => setError(message(value))).finally(() => setLoadingLeads(false)); }, [user?.role]);
  const canCreate = user?.role !== 'client';
  async function downloadQuotation(item: Quotation) {
    setDownloadingId(item.id); setDownloadError('');
    try { await quotationApi.download(item.id, item.quotationNumber); }
    catch (value) { setDownloadError(message(value)); }
    finally { setDownloadingId(''); }
  }
  const sortedItems = [...items].sort((a, b) => { const result = a.updatedAt.localeCompare(b.updatedAt); return sortDirection === 'asc' ? result : -result; });

  return <section className="page quotations-page">
    <div className="page-heading"><div><p className="eyebrow">Commercial workspace</p><h1>Quotations</h1><p className="muted">Prepare, send and review proposals. Requirement context is optional.</p></div></div>
    {canCreate && <div className="card quotation-lead-entry"><div className="section-heading"><div><h2>Start from a lead</h2><p className="muted">Choose a lead to create its quotation. Add-on requirement context is not mandatory.</p></div></div>{loadingLeads ? <div className="screen-state">Loading available leads…</div> : <LeadTable leads={leads} createPath="quotations" />}</div>}
    <div className="card quotation-list-card"><div className="section-heading"><div><h2>Quotation pipeline</h2><p className="muted">Only quotations authorized for your account are shown.</p></div><label className="filter-field">Status<select value={status} onChange={event => { setStatus(event.target.value as QuotationStatus | ''); setSkip(0); }}><option value="">All statuses</option>{statuses.map(value => <option key={value} value={value}>{value}</option>)}</select></label></div>
      {error && <div className="error" role="alert">{error}</div>}{downloadError && <div className="error" role="alert">{downloadError}</div>}
      {loading ? <div className="screen-state">Loading quotations…</div> : items.length ? <><div className="responsive-record-list quotation-list"><div className="responsive-record-list__toolbar"><button type="button" className="table-sort" onClick={() => setSortDirection(current => current === 'asc' ? 'desc' : 'asc')}>Updated {sortDirection === 'asc' ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}</button></div>{sortedItems.map(item => <ResponsiveRecordCard key={item.id} title={item.quotationNumber} subtitle={`Updated ${date(item.updatedAt)}`} fields={[{ label: 'Client', value: item.clientName || <UserIdentity id={item.clientId} fallback="Client" /> }, { label: 'Relationship', value: item.projectId ? 'Project linked' : item.leadId ? 'Lead linked' : 'Not linked' }, { label: 'Status', value: <QuotationStatusBadge status={item.status} /> }, { label: 'Total', value: <strong className="quotation-total">{money(item.totalAmount)}</strong> }, { label: 'Next action', value: item.status === 'Accepted' && item.projectId ? <Link className="quotation-next-action" to={`/app/projects/${item.projectId}`}>Open project <ArrowRight size={14} aria-hidden="true" /></Link> : nextAction(item.status), className: 'responsive-record-card__next-action' }]} actions={<><Link className="text-link" to={`/app/quotations/${item.id}`}>Open quotation <ArrowRight size={16} aria-hidden="true" /></Link><button className="secondary" type="button" disabled={downloadingId === item.id} onClick={() => void downloadQuotation(item)}>{downloadingId === item.id ? 'Preparing PDF…' : 'Download PDF'}</button></>} />)}</div><div className="pagination"><button className="secondary" disabled={!skip || loading} onClick={() => setSkip(Math.max(0, skip - limit))}>Previous</button><span className="muted">Showing {skip + 1}–{skip + items.length}</span><button className="secondary" disabled={items.length < limit || loading} onClick={() => setSkip(skip + limit)}>Next</button></div></> : <div className="empty-state"><h3>No quotations yet</h3><p>{skip ? 'No more quotations on this page.' : 'Create a quotation from a qualified lead. A requirement is optional.'}</p>{canCreate && <Link className="button-link" to="/app/quotations">Choose a lead to get started</Link>}</div>}
    </div>
  </section>;
}
