import type { Deliverable, DeliverableStatus } from '../types';
import { DeliverableStatusBadge } from './DeliverableStatusBadge';

type DeliverableItemProps = {
  item: Deliverable;
  detail: Deliverable | null;
  expanded: boolean;
  busy: boolean;
  canManage: boolean;
  canDelete: boolean;
  transitions: DeliverableStatus[];
  onDetails: (item: Deliverable) => void;
  onEdit: (item: Deliverable) => void;
  onTransition: (item: Deliverable, next: DeliverableStatus) => void;
  onDelete: (item: Deliverable) => void;
};

const date = (value?: string | null) => value ? new Date(value).toLocaleDateString() : 'Not set';
const overdue = (value?: string | null) => Boolean(value && new Date(value).getTime() < Date.now());

export function DeliverableItem({ item, detail, expanded, busy, canManage, canDelete, transitions, onDetails, onEdit, onTransition, onDelete }: DeliverableItemProps) {
  const visibleDetail = detail ?? item;
  return <article className={`deliverable-item deliverable-${item.status}`}>
    <div className="deliverable-main">
      <div className="deliverable-title-row"><h3>{item.title}</h3><DeliverableStatusBadge status={item.status} /></div>
      {item.description && <p>{item.description}</p>}
      <div className="deliverable-meta"><span className={overdue(item.dueDate) && !['completed', 'cancelled'].includes(item.status) ? 'deliverable-overdue' : ''}>{overdue(item.dueDate) && !['completed', 'cancelled'].includes(item.status) ? 'Overdue · ' : 'Due '}{date(item.dueDate)}</span>{item.status === 'completed' && <span>Completed {date(item.completedAt)}</span>}{item.status === 'cancelled' && <span>Excluded from progress</span>}</div>
    </div>
    <div className="deliverable-actions">
      <button className="secondary" disabled={busy} onClick={() => onDetails(item)}>{expanded ? 'Hide details' : 'Details'}</button>
      {canManage && !['completed', 'cancelled'].includes(item.status) && <button className="secondary" disabled={busy} onClick={() => onEdit(item)}>Edit</button>}
      {canManage && transitions.map(next => <button key={next} className={next === 'completed' ? '' : 'secondary'} disabled={busy} onClick={() => onTransition(item, next)}>{next === 'in_progress' ? 'Move to in progress' : next === 'blocked' ? 'Mark blocked' : next === 'completed' ? 'Complete' : 'Cancel'}</button>)}
      {canDelete && <button className="secondary danger-action" disabled={busy} onClick={() => onDelete(item)}>Delete</button>}
    </div>
    {expanded && <div className="deliverable-detail"><dl><div><dt>Client visibility</dt><dd>{visibleDetail.clientVisible ? 'Visible to client' : 'Internal only'}</dd></div>{visibleDetail.notes && <div><dt>Notes</dt><dd>{visibleDetail.notes}</dd></div>}{canManage && visibleDetail.completedBy && <div><dt>Completed by</dt><dd><code>{visibleDetail.completedBy}</code></dd></div>}</dl></div>}
  </article>;
}


