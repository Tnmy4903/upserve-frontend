import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { UserIdentity } from '../../../components/UserIdentity';
import { ResponsiveRecordCard } from '../../../components/ResponsiveRecordCard';
import type { Lead } from '../types';
import { LeadStatusBadge } from './LeadStatusBadge';

export function LeadTable({ leads, createPath }: { leads: Lead[]; createPath?: 'requirements' | 'quotations' }) {
  const actionLabel = createPath === 'requirements' ? 'Create requirement' : createPath === 'quotations' ? 'Create quotation' : 'Open lead';
  return <div className="responsive-record-list lead-record-list">{leads.map(lead => <ResponsiveRecordCard key={lead.id} title={lead.contactPerson} subtitle={lead.email} titleMeta={<LeadStatusBadge stage={lead.stage} />} fields={[{ label: 'Company', value: lead.companyName || '—' }, { label: 'Business', value: lead.business }, { label: 'Assigned to', value: <span className="lead-assignee"><UserIdentity id={lead.assignedTo} fallback="Unassigned" />{(lead.assignedToIds?.length || 0) > 1 && <small>{lead.assignedToIds?.length} Sub Admins</small>}</span> }, { label: 'Created', value: new Date(lead.createdAt).toLocaleDateString() }]} actions={<Link className="text-link" to={createPath === 'requirements' ? `/app/requirements?leadId=${encodeURIComponent(lead.id)}` : createPath === 'quotations' ? `/app/quotations/new?leadId=${encodeURIComponent(lead.id)}` : `/app/leads/${lead.id}`}>{actionLabel} <ArrowRight size={16} aria-hidden="true" /></Link>} />)}</div>;
}
