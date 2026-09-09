import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';
import { leadApi } from '../features/leads/services/leadApi';
import { LeadStatusBadge } from '../features/leads/components/LeadStatusBadge';
import { quotationApi } from '../features/quotations/services/quotationApi';
import { QuotationStatusBadge } from '../features/quotations/components/QuotationStatusBadge';
import { projectApi } from '../features/projects/services/projectApi';
import { ProjectStatusBadge } from '../features/projects/components/ProjectStatusBadge';
import type { Lead } from '../features/leads/types';
import type { Quotation } from '../features/quotations/types';
import type { Project } from '../features/projects/types';

type AttentionItem = { id: string; type: 'lead' | 'quotation' | 'project' | 'invoice'; title: string; reason: string; status: string; href: string; };

const errorText = (value: unknown) => value instanceof ApiError ? value.message : value instanceof Error ? value.message : 'Unable to load dashboard data.';
const formatRole = (role?: string) => role === 'super_admin' ? 'Super Admin' : role === 'sub_admin' ? 'Sub Admin' : 'Client';
const money = (value: number) => value.toLocaleString(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

function SummaryLine({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return <div className="dashboard-summary-line"><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div>;
}

function AttentionRow({ item }: { item: AttentionItem }) {
  const badge = item.type === 'lead' ? <LeadStatusBadge stage={item.status as Lead['stage']} /> : item.type === 'quotation' ? <QuotationStatusBadge status={item.status as Quotation['status']} /> : item.type === 'project' ? <ProjectStatusBadge status={item.status as Project['status']} /> : <span className="status-badge">{item.status}</span>;
  return <Link className="dashboard-attention-row" to={item.href}><span className="dashboard-attention-type">{item.type}</span><span className="dashboard-attention-main"><strong>{item.title}</strong><small>{item.reason}</small></span><span className="dashboard-attention-status">{badge}</span><ArrowRight className="dashboard-attention-arrow" size={16} aria-hidden="true" /></Link>;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true); setErrors([]);
    const admin = user.role !== 'client'; const canSeeQuotations = user.role !== 'sub_admin';
    const results = await Promise.allSettled([
      admin ? leadApi.list({ skip: 0, limit: 100 }) : Promise.resolve([] as Lead[]),
      canSeeQuotations ? quotationApi.list({ skip: 0, limit: 100 }) : Promise.resolve([] as Quotation[]),
      admin ? projectApi.listAll() : projectApi.listMine(),
    ]);
    const failures: string[] = [];
    const [leadResult, quotationResult, projectResult] = results;
    if (leadResult.status === 'fulfilled') setLeads(leadResult.value); else failures.push('Leads: ' + errorText(leadResult.reason));
    if (quotationResult.status === 'fulfilled') setQuotations(quotationResult.value); else failures.push('Quotations: ' + errorText(quotationResult.reason));
    if (projectResult.status === 'fulfilled') setProjects(projectResult.value); else failures.push('Projects: ' + errorText(projectResult.reason));
    setErrors(failures); setLastUpdated(new Date()); setLoading(false);
  }, [user]);
  useEffect(() => { void load(); }, [load]);

  const attention = useMemo<AttentionItem[]>(() => {
    const items: AttentionItem[] = [];
    if (user?.role !== 'client') {
      leads.filter(lead => !['Won', 'Lost'].includes(lead.stage)).slice(0, 4).forEach(lead => items.push({ id: lead.id, type: 'lead', title: lead.companyName || lead.contactPerson, reason: 'Lead is still active in the sales pipeline.', status: lead.stage, href: '/app/leads/' + lead.id }));
    }
    quotations.filter(quotation => user?.role === 'client' ? ['Sent', 'Revision Requested'].includes(quotation.status) : quotation.status === 'Draft').slice(0, 4).forEach(quotation => items.push({ id: quotation.id, type: 'quotation', title: quotation.quotationNumber, reason: user?.role === 'client' ? 'Your response is needed.' : 'Quotation is ready for the next admin action.', status: quotation.status, href: '/app/quotations/' + quotation.id }));
    projects.forEach(project => {
      const unpaid = project.invoiceSchedule?.find(stage => stage.invoiceId && !stage.isPaid);
      if (unpaid) items.push({ id: unpaid.invoiceId || project.id, type: 'invoice', title: project.title + ' · ' + unpaid.stage, reason: 'Payment stage is outstanding.', status: unpaid.status, href: '/app/projects/' + project.id });
      else if (user?.role !== 'client' && project.status === 'pending') items.push({ id: project.id, type: 'project', title: project.title, reason: 'Project is waiting to move into delivery work.', status: project.status, href: '/app/projects/' + project.id });
    });
    return items.slice(0, 8);
  }, [leads, projects, quotations, user?.role]);

  const attentionLabel = user?.role === 'client' ? 'Your next steps' : 'Needs your attention';
  const primaryAction = user?.role === 'client' ? { label: 'Open my projects', href: '/app/projects' } : user?.role === 'sub_admin' ? { label: 'Review my leads', href: '/app/leads' } : { label: 'Review pipeline', href: '/app/leads' };
  return <section className="page dashboard-page">
    <div className="page-heading dashboard-heading"><div><p className="eyebrow">Workspace</p><h1>Welcome, {user?.name}</h1><p className="muted">{formatRole(user?.role)} workspace · Operational overview</p></div><div className="dashboard-heading-actions"><span className="dashboard-freshness">{lastUpdated && <><Clock3 size={14} aria-hidden="true" /> Updated {lastUpdated.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</>}</span><button className="secondary" onClick={() => void load()} disabled={loading}><RefreshCw size={15} className={loading ? 'ui-spinner' : ''} aria-hidden="true" />{loading ? 'Refreshing…' : 'Refresh'}</button></div></div>
    {errors.length > 0 && <div className="error dashboard-error" role="alert"><strong>Some workspace data could not be refreshed.</strong><ul>{errors.map(error => <li key={error}>{error}</li>)}</ul><button type="button" className="text-button" onClick={() => void load()} disabled={loading}>Try again</button></div>}
    {loading ? <div className="card dashboard-loading" role="status"><div className="loading-spinner" aria-hidden="true" /><span>Loading your workspace…</span></div> : <div className="dashboard-content">
      <section className="card dashboard-summary"><div className="section-heading"><div><p className="eyebrow">Live workspace context</p><h2>{user?.role === 'client' ? 'Your work at a glance' : 'Operational summary'}</h2></div><span className="muted">Based on accessible records</span></div><div className="dashboard-summary-grid">
        {user?.role !== 'client' && <SummaryLine label="Active leads" value={leads.filter(lead => !['Won', 'Lost'].includes(lead.stage)).length} detail="Open pipeline" />}
        {user?.role !== 'sub_admin' && <SummaryLine label="Quotations" value={quotations.length} detail={quotations.filter(item => ['Sent', 'Revision Requested'].includes(item.status)).length + ' awaiting response'} />}
        <SummaryLine label="Projects" value={projects.length} detail={projects.filter(item => !['delivered', 'completed'].includes(item.status)).length + ' in delivery'} />
        <SummaryLine label="Outstanding" value={money(projects.reduce((total, project) => total + (project.outstandingAmount || 0), 0))} detail="From accessible projects" />
      </div></section>
      <section className="card dashboard-attention"><div className="section-heading"><div><p className="eyebrow">Next actions</p><h2>{attentionLabel}</h2></div><span className="muted">{attention.length} item{attention.length === 1 ? '' : 's'}</span></div>{attention.length ? <div className="dashboard-attention-list">{attention.map(item => <AttentionRow item={item} key={item.type + item.id} />)}</div> : <div className="dashboard-empty"><div className="empty-state-icon" aria-hidden="true"><CheckCircle2 size={20} /></div><h3>You’re all caught up</h3><p>No actionable items are available in your current workspace.</p></div>}<Link className="dashboard-primary-action" to={primaryAction.href}>{primaryAction.label}<ArrowRight size={16} aria-hidden="true" /></Link></section>
    </div>}
  </section>;
}
