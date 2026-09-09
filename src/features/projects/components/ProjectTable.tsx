import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { ResponsiveRecordCard } from '../../../components/ResponsiveRecordCard';
import { UserIdentity } from '../../../components/UserIdentity';
import type { Project } from '../types';
import { ProjectStatusBadge } from './ProjectStatusBadge';

const money = (value?: number | null) => value == null ? 'Not set' : value.toLocaleString(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const date = (value: string) => new Date(value).toLocaleDateString();
const terminal = (status: Project['status']) => status === 'delivered' || status === 'completed';
const nextAction = (project: Project) => terminal(project.status) ? 'Review delivery' : project.status === 'pending' ? 'Start project' : project.progressPercentage == null ? 'Set progress' : 'Open workspace';
const isStale = (project: Project) => !terminal(project.status) && Date.now() - new Date(project.updatedAt).getTime() > 14 * 24 * 60 * 60 * 1000;

export function ProjectTable({ projects, showInternalBudget }: { projects: Project[]; showInternalBudget: boolean }) {
  const [sort, setSort] = useState<'title' | 'status' | 'progress' | 'updated'>('updated');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');
  const sorted = useMemo(() => [...projects].sort((a, b) => { const av = sort === 'title' ? a.title : sort === 'status' ? a.status : sort === 'progress' ? a.progressPercentage ?? -1 : a.updatedAt; const bv = sort === 'title' ? b.title : sort === 'status' ? b.status : sort === 'progress' ? b.progressPercentage ?? -1 : b.updatedAt; const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv)); return direction === 'asc' ? result : -result; }), [projects, sort, direction]);
  const header = (label: string, value: 'title' | 'status' | 'progress' | 'updated') => <button type="button" className="table-sort" onClick={() => { if (sort === value) setDirection(current => current === 'asc' ? 'desc' : 'asc'); else { setSort(value); setDirection(value === 'updated' ? 'desc' : 'asc'); } }}>{label} {sort === value ? (direction === 'asc' ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />) : null}</button>;
  return <div className="responsive-record-list project-table">
    <div className="responsive-record-list__toolbar">{header('Updated', 'updated')}</div>
    {sorted.map(project => <ResponsiveRecordCard
      key={project.id}
      title={project.title}
      subtitle={project.leadId ? 'Lead-linked project' : 'Direct client quotation'}
      titleMeta={isStale(project) && <span className="project-stale-flag">Needs attention</span>}
      fields={[
        { label: 'Client', value: <UserIdentity id={project.userId} fallback="Client" /> },
        { label: 'Status', value: <ProjectStatusBadge status={project.status} /> },
        { label: 'Progress', value: <><span>{project.progressPercentage == null ? 'Not started' : `${project.progressPercentage}%`}</span>{project.progressPercentage != null && <span className="project-mini-progress" aria-hidden="true"><span style={{ width: `${Math.min(100, Math.max(0, project.progressPercentage))}%` }} /></span>}</> },
        ...(showInternalBudget ? [{ label: 'Budget', value: money(project.budget) }] : []),
        { label: 'Last activity', value: date(project.updatedAt) },
      ]}
      actions={<Link className="table-action" to={`/app/projects/${project.id}`}><span>{nextAction(project)}</span><ArrowRight size={15} aria-hidden="true" /></Link>}
    />)}
  </div>;
}
