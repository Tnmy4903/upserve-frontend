import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ApiError } from '../../../services/apiClient';
import { RequirementForm } from '../components/RequirementForm';
import { RequirementStatusBadge } from '../components/RequirementStatusBadge';
import { requirementApi } from '../services/requirementApi';
import type { Requirement, RequirementCreate } from '../types';
import { projectApi } from '../../projects/services/projectApi';
import type { Project } from '../../projects/types';

const errorMessage = (value: unknown) => value instanceof ApiError ? value.message : value instanceof Error ? value.message : 'Unable to complete the request.';

export function RequirementsPage() {
  const { user } = useAuth(); const navigate = useNavigate(); const [params] = useSearchParams(); const projectId = params.get('projectId') || undefined;
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [projects, setProjects] = useState<Project[]>([]); const [requirements, setRequirements] = useState<Record<string, Requirement | null>>({}); const [loadingProjects, setLoadingProjects] = useState(false);
  useEffect(() => {
    if (user?.role !== 'client') return;
    setLoadingProjects(true); setError('');
    void projectApi.listMine().then(async nextProjects => {
      setProjects(nextProjects);
      const pairs = await Promise.all(nextProjects.map(async project => { try { return [project.id, await requirementApi.forProject(project.id)] as const; } catch (value) { if (value instanceof ApiError && value.status === 404) return [project.id, null] as const; throw value; } }));
      setRequirements(Object.fromEntries(pairs));
    }).catch(value => setError(errorMessage(value))).finally(() => setLoadingProjects(false));
  }, [user?.role]);
  async function create(payload: RequirementCreate, attachment?: File) { setBusy(true); setError(''); try { const created: Requirement = await requirementApi.create(payload); if (attachment) { try { await requirementApi.uploadAttachment(created.id, attachment); } catch (value) { setError(`Requirement saved, but the supporting file could not be attached: ${errorMessage(value)}`); navigate(`/app/requirements/${created.id}`); return; } } navigate(`/app/requirements/${created.id}`); } catch (value) { setError(errorMessage(value)); } finally { setBusy(false); } }
  if (user?.role !== 'client') return <section className="page requirements-page"><div className="page-heading"><div><p className="eyebrow">Scope and discovery</p><h1>Requirement review</h1><p className="muted">Requirements are submitted by clients from their project. Open a linked lead or project to review and approve them.</p></div></div></section>;
  if (projectId) return <section className="page requirements-page"><div className="page-heading"><div><p className="eyebrow">Scope and discovery</p><h1>Project requirement</h1><p className="muted">Share the context, goals and priorities your team should understand before work begins.</p></div></div>{error && <div className="error" role="alert">{error}</div>}<RequirementForm projectId={projectId} relationshipLabel={projects.find(project => project.id === projectId)?.title} busy={busy} onSubmit={(payload, attachment) => create(payload as RequirementCreate, attachment)} /></section>;
  return <section className="page requirements-page"><div className="page-heading"><div><p className="eyebrow">Scope and discovery</p><h1>Your project requirements</h1><p className="muted">Choose a project to review its existing brief or create one where it is still missing.</p></div></div>{error && <div className="error" role="alert">{error}</div>}{loadingProjects ? <div className="screen-state">Loading your projects…</div> : projects.length ? <div className="card"><div className="section-heading"><div><h2>Project briefs</h2><p className="muted">Each project has one requirement brief.</p></div></div><div className="requirements-project-list">{projects.map(project => { const requirement = requirements[project.id]; return <div className="requirement-project-row" key={project.id}><div><strong>{project.title}</strong><span className="muted">{requirement ? 'Requirement submitted' : 'No requirement submitted yet'}</span></div>{requirement ? <div className="requirement-project-actions"><RequirementStatusBadge status={requirement.status} /><Link className="button-link secondary" to={`/app/requirements/${requirement.id}`}>Open requirement</Link></div> : <Link className="button-link" to={`/app/requirements/new?projectId=${encodeURIComponent(project.id)}`}>Create requirement</Link>}</div>; })}</div></div> : <div className="empty-state"><h2>No projects yet</h2><p className="muted">Requirements become available after a project is created for your account.</p></div>}</section>;
}
