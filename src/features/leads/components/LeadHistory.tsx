import type { LeadHistoryEvent } from '../types';
import { UserIdentity } from '../../../components/UserIdentity';

export function LeadHistory({ events }: { events: LeadHistoryEvent[] }) {
  if (!events.length) return <p className="muted">No history recorded yet.</p>;
  const isUserReference = (field?: string | null) => field === 'assignedTo' || field === 'clientId';
  return <div className="lead-timeline">{events.map((event, index) => <article className="timeline-item" key={`${event.timestamp}-${index}`}><div><strong>{event.action}</strong><time>{new Date(event.timestamp).toLocaleString()}</time></div>{event.message && <p>{event.message}</p>}{event.field && <small>{event.field}: {event.oldValue ? isUserReference(event.field) ? <UserIdentity id={event.oldValue} /> : event.oldValue : '—'} → {event.newValue ? isUserReference(event.field) ? <UserIdentity id={event.newValue} /> : event.newValue : '—'} · by <UserIdentity id={event.changedBy} /></small>}</article>)}</div>;
}
