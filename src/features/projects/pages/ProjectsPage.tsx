import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ApiError } from '../../../services/apiClient';
import { projectApi } from '../services/projectApi';
import { projectStatuses, type Project, type ProjectStatus } from '../types';
import { ProjectTable } from '../components/ProjectTable';
import { FolderKanban, RefreshCw, Search, X } from 'lucide-react';

const message = (error: unknown) => error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Unable to load projects.';

export function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<ProjectStatus | ''>('');
  async function refresh() { setLoading(true); setError(''); try { setProjects(user?.role === 'client' ? await projectApi.listMine() : await projectApi.listAll()); } catch (value) { setError(message(value)); } finally { setLoading(false); } }
  useEffect(() => { void refresh(); }, [user?.role]);
  useEffect(() => { const timer = window.setTimeout(() => setQuery(searchQuery), 300); return () => window.clearTimeout(timer); }, [searchQuery]);
  const visibleProjects = useMemo(() => { const normalized = query.trim().toLowerCase(); return projects.filter(project => `${project.title} ${project.id}`.toLowerCase().includes(normalized) && (!status || project.status === status)); }, [projects, query, status]);
  const hasFilters = Boolean(searchQuery.trim() || status);
  return <section className="page projects-page"><div className="projects-hero"><div><p className="eyebrow">Delivery workspace</p><h1>Projects</h1><p className="projects-lede">A focused view of work created from accepted quotations, with progress and ownership kept in one place.</p></div><button className="secondary refresh-projects" onClick={() => void refresh()} disabled={loading}><RefreshCw size={16} aria-hidden="true" /> {loading ? 'Refreshing…' : 'Refresh'}</button></div>{error && <div className="error" role="alert">{error}<button className="secondary" onClick={() => void refresh()} disabled={loading}>Retry</button></div>}{loading ? <div className="screen-state">Loading projects…</div> : projects.length ? <section className="card project-list-card"><div className="project-list-header"><div><p className="eyebrow">Project list</p><h2>{user?.role === 'client' ? 'Your projects' : 'All projects'}</h2><p className="muted">{visibleProjects.length} of {projects.length} projects visible</p></div><div className="project-filters"><label className="project-search"><span className="sr-only">Search projects</span><Search size={16} aria-hidden="true" /><input type="search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search projects" />{searchQuery && <button type="button" className="icon-button" aria-label="Clear project search" onClick={() => setSearchQuery('')}><X size={14} aria-hidden="true" /></button>}</label><label><span className="sr-only">Filter by status</span><select value={status} onChange={event => setStatus(event.target.value as ProjectStatus | '')}><option value="">All status</option>{projectStatuses.map(value => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}</select></label></div></div>{hasFilters && <div className="active-filter-chips"><span className="muted">Active filters</span>{searchQuery.trim() && <button type="button" className="filter-chip" onClick={() => setSearchQuery('')}>Search: {searchQuery.trim()} <X size={13} aria-hidden="true" /></button>}{status && <button type="button" className="filter-chip" onClick={() => setStatus('')}>Status: {status.replace('_', ' ')} <X size={13} aria-hidden="true" /></button>}<button type="button" className="ghost" onClick={() => { setSearchQuery(''); setQuery(''); setStatus(''); }}>Clear filters</button></div>}{visibleProjects.length ? <ProjectTable projects={visibleProjects} showInternalBudget={user?.role !== 'client'} /> : <div className="empty-state project-filter-empty"><h3>No matching projects</h3><p>Try another project name or clear the active filters.</p><button className="secondary" onClick={() => { setSearchQuery(''); setQuery(''); setStatus(''); }}>Clear filters</button></div>}</section> : <div className="empty-state project-empty"><div className="empty-state-icon" aria-hidden="true"><FolderKanban size={20} /></div><h2>No projects yet</h2><p>Projects appear here automatically when a quotation is accepted.</p></div>}</section>;
}
