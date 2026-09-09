import { useEffect, useMemo, useState } from 'react';
import { ApiError, apiRequest } from '../../../services/apiClient';
import { recordDirectoryColumns } from './recordDirectoryColumns';
import { X } from 'lucide-react';
import { CopyButton } from '../../../components/ui';

type RecordRow = Record<string, unknown>;
type ReferenceData = Record<string, RecordRow[]>;

const labels: Record<string, string> = {
  users: 'Users', leads: 'Leads', requirements: 'Requirements', quotations: 'Quotations',
  projects: 'Projects', deliverables: 'Deliverables', invoices: 'Invoices',
};
const id = (value: unknown) => value == null ? '—' : String(value);
const date = (value: unknown) => value ? new Date(String(value)).toLocaleDateString() : '—';
const money = (value: unknown) => typeof value === 'number' ? value.toLocaleString(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }) : id(value);

export function RecordDirectoryPage() {
  const [data, setData] = useState<ReferenceData | null>(null);
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [entityType, setEntityType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true); setError('');
    try { setData(await apiRequest<ReferenceData>('/api/admin/reference-data')); }
    catch (value) { setError(value instanceof ApiError ? value.message : 'Unable to load the record directory.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  useEffect(() => { const timer = window.setTimeout(() => setQuery(searchQuery), 300); return () => window.clearTimeout(timer); }, [searchQuery]);

  const search = query.trim().toLowerCase();
  const userMap = useMemo(() => new Map((data?.users || []).flatMap(user => {
    const record = user as RecordRow;
    const userId = record.id ?? record._id ?? record.userId;
    return userId == null ? [] : [[id(userId), user]] as [string, RecordRow][];
  })), [data]);
  const projectMap = useMemo(() => new Map((data?.projects || []).map(project => [id(project.id), project])), [data]);
  const leadMap = useMemo(() => new Map((data?.leads || []).map(lead => [id(lead.id), lead])), [data]);
  const quotationMap = useMemo(() => new Map((data?.quotations || []).map(quotation => [id(quotation.id), quotation])), [data]);
  const display = (value: unknown) => {
    const user = userMap.get(id(value));
    return user ? id(user.name || (user as RecordRow).fullName || (user as RecordRow).displayName) : id(value);
  };
  const matches = (row: RecordRow) => !search || Object.values(row).some(value => String(value ?? '').toLowerCase().includes(search));

  return <section className="page record-directory-page">
    <div className="page-heading"><div><p className="eyebrow">Super Admin reference</p><h1>Record directory</h1><p className="muted">Readable names, emails and relationship IDs for tracing the complete business flow.</p></div><button className="secondary" onClick={() => void load()} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button></div>
    <div className="record-directory-toolbar"><label>Search all records<div className="search-with-clear"><input type="search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Name, email, project ID, lead ID…" />{searchQuery && <button type="button" className="icon-button" aria-label="Clear directory search" onClick={() => setSearchQuery('')}><X size={14} aria-hidden="true" /></button>}</div></label><label>Entity type<select value={entityType} onChange={event => setEntityType(event.target.value)}><option value="">All record types</option>{Object.entries(labels).map(([key, title]) => <option key={key} value={key}>{title}</option>)}</select></label>{(searchQuery.trim() || entityType) && <div className="active-filter-chips"><span className="muted">Active filters</span>{searchQuery.trim() && <button type="button" className="filter-chip" onClick={() => setSearchQuery('')}>Search: {searchQuery.trim()} <X size={13} aria-hidden="true" /></button>}{entityType && <button type="button" className="filter-chip" onClick={() => setEntityType('')}>Entity type: {labels[entityType]} <X size={13} aria-hidden="true" /></button>}<button type="button" className="ghost" onClick={() => { setSearchQuery(''); setQuery(''); setEntityType(''); }}>Clear filters</button></div>}<span className="muted">Use these IDs when opening a record or checking a relationship.</span></div>
    {error && <div className="error" role="alert">{error}</div>}
    {loading ? <div className="card screen-state">Loading record directory…</div> : <div className="record-directory-grid">{Object.entries(labels).filter(([key]) => !entityType || key === entityType).map(([key, title]) => <DirectorySection key={key} title={title} rows={(data?.[key] || []).filter(matches)} display={display} projectMap={projectMap} leadMap={leadMap} quotationMap={quotationMap} />)}</div>}
  </section>;
}

function DirectorySection({ title, rows, display, projectMap, leadMap, quotationMap }: { title: string; rows: RecordRow[]; display: (value: unknown) => string; projectMap: Map<string, RecordRow>; leadMap: Map<string, RecordRow>; quotationMap: Map<string, RecordRow> }) {
  const columns = recordDirectoryColumns[title];
  const heading = (column: string) => ({ clientId: 'Client', userId: 'Client', assignedSubAdmin: 'Assigned Sub Admin', assignedTo: 'Assigned To', leadId: 'Lead', quotationId: 'Quotation', invoiceNumber: 'Invoice', stage: 'Stage', totalAmount: 'Total', amount: 'Amount' }[column] || (column === 'projectId' ? 'Project' : column.replace(/([A-Z])/g, ' $1')));
  return <section className="card directory-section"><div className="section-heading"><div><h2>{title}</h2><span className="muted">{rows.length} record{rows.length === 1 ? '' : 's'}</span></div></div>{rows.length ? <div className="table-wrap"><table className="directory-table"><thead><tr><th>ID</th>{columns.map(column => <th key={column}>{heading(column)}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={id(row.id)}><td data-label="ID"><span className="copyable-id"><code>{id(row.id)}</code>{row.id != null && <CopyButton value={id(row.id)} />}</span></td>{columns.map(column => <td data-label={heading(column)} key={column}>{column === 'projectId' ? <span className="directory-identity">{projectMap.get(id(row[column]))?.title ? id(projectMap.get(id(row[column]))?.title) : id(row[column])}</span> : column === 'quotationId' ? <span className="directory-identity">{quotationMap.get(id(row[column]))?.quotationNumber ? id(quotationMap.get(id(row[column]))?.quotationNumber) : id(row[column])}</span> : column === 'leadId' ? <span className="directory-identity">{leadMap.get(id(row[column]))?.contactPerson ? id(leadMap.get(id(row[column]))?.contactPerson) : id(row[column])}</span> : column === 'assignedSubAdmin' ? <span className="directory-identity">{display(row.assignedSubAdmin || row.assignedAdmin || leadMap.get(id(row.leadId))?.assignedTo)}</span> : ['clientId', 'assignedTo', 'assignedAdmin', 'userId'].includes(column) ? <span className="directory-identity">{display(row[column])}</span> : ['deadline', 'dueDate'].includes(column) ? date(row[column]) : column === 'totalAmount' || column === 'amount' ? money(row[column]) : id(row[column])}</td>)}</tr>)}</tbody></table></div> : <div className="empty-state directory-empty"><h3>No matching {title.toLowerCase()}.</h3></div>}</section>;
}
