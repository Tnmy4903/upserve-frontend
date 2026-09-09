import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ApiError } from '../../../services/apiClient';
import { deliverableApi } from '../services/deliverableApi';
import { allowedTransitions, type Deliverable, type DeliverablePayload, type DeliverableStatus } from '../types';
import { DeliverableForm } from './DeliverableForm';
import { DeliverableItem } from './DeliverableItem';
import { useConfirm } from '../../../components/ui';

const errorMessage = (error: unknown) => error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Unable to complete the deliverable request.';
type DeliverablesSectionProps = { projectId: string; onChanged: () => Promise<void> };

export function DeliverablesSection({ projectId, onChanged }: DeliverablesSectionProps) {
  const { user } = useAuth();
  const confirm = useConfirm();
  const canManage = user?.role === 'super_admin' || user?.role === 'sub_admin';
  const canDelete = user?.role === 'super_admin';
  const [items, setItems] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState<Deliverable | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState('');
  const [detail, setDetail] = useState<Deliverable | null>(null);

  async function refresh() {
    setLoading(true); setError('');
    try { setItems(await deliverableApi.list(projectId)); }
    catch (value) { setError(errorMessage(value)); }
    finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, [projectId]);

  async function action(request: () => Promise<unknown>, message: string): Promise<boolean> {
    setBusy(true); setError(''); setSuccess('');
    try { await request(); await refresh(); await onChanged(); setSuccess(message); return true; }
    catch (value) { setError(errorMessage(value)); return false; }
    finally { setBusy(false); }
  }

  async function toggleDetail(item: Deliverable) {
    if (expandedId === item.id) { setExpandedId(''); setDetail(null); return; }
    setExpandedId(item.id); setDetail(null);
    try { setDetail(await deliverableApi.get(item.id)); }
    catch (value) { setError(errorMessage(value)); }
  }

  async function handleTransition(item: Deliverable, next: DeliverableStatus) {
    if (next === 'completed' && !(await confirm({ title: 'Complete deliverable', message: `This marks “${item.title}” as completed.` }))) return;
    void action(() => deliverableApi.updateStatus(item.id, next), `Deliverable moved to ${next.replace('_', ' ')}.`);
  }

  async function handleDelete(item: Deliverable) {
    if (await confirm({ title: 'Delete deliverable', message: `This permanently deletes “${item.title}”.`, destructive: true })) void action(() => deliverableApi.remove(item.id), 'Deliverable deleted.');
  }

  function createOrUpdate(payload: DeliverablePayload) {
    void action(() => editing ? deliverableApi.update(editing.id, payload) : deliverableApi.create(projectId, payload), editing ? 'Deliverable updated.' : 'Deliverable created.')
      .then(successful => { if (successful) { setEditing(null); setShowForm(false); } });
  }

  return <section className="card deliverables-card">
    <div className="section-heading deliverables-heading"><div><p className="eyebrow">Project work items</p><h2>Deliverables</h2><p className="muted">Track the work that drives this project’s backend-derived progress.</p></div>{canManage && <button onClick={() => { setEditing(null); setShowForm(value => !value); }}>{showForm ? 'Close form' : '+ Add deliverable'}</button>}</div>
    {error && <div className="error" role="alert">{error}</div>}{success && <div className="success" role="status">{success}</div>}
    {showForm && canManage && <DeliverableForm busy={busy} onSubmit={createOrUpdate} onCancel={() => setShowForm(false)} />}{editing && <DeliverableForm initial={editing} busy={busy} onSubmit={createOrUpdate} onCancel={() => setEditing(null)} />}
    {loading ? <div className="deliverables-loading">Loading deliverables…</div> : items.length ? <div className="deliverable-list">{items.map(item => <DeliverableItem key={item.id} item={item} detail={expandedId === item.id ? detail : null} expanded={expandedId === item.id} busy={busy} canManage={canManage} canDelete={canDelete} transitions={allowedTransitions[item.status]} onDetails={toggleDetail} onEdit={item => { setEditing(item); setShowForm(false); }} onTransition={handleTransition} onDelete={handleDelete} />)}</div> : <div className="empty-state deliverables-empty"><h3>No deliverables yet</h3><p>{canManage ? 'Add the first work item to start tracking delivery progress.' : 'No client-visible deliverables have been added yet.'}</p>{canManage && <button onClick={() => setShowForm(true)}>Create deliverable</button>}</div>}
  </section>;
}
