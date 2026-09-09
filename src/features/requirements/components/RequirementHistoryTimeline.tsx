import { CheckCircle2, CircleAlert, Clock3, FileText, History } from 'lucide-react';
import type { RequirementHistoryEvent } from '../types';

const formatDate = (value: string) => new Date(value).toLocaleString();
const actionLabel = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, character => character.toUpperCase());
const actionIcon = (value: string) => value.includes('approved') ? CheckCircle2 : value.includes('change') ? CircleAlert : value.includes('attachment') ? FileText : value === 'created' ? History : Clock3;

export function RequirementHistoryTimeline({ history }: { history: RequirementHistoryEvent[] }) {
  return <section className="card requirement-history-inline"><div className="section-heading"><div><p className="eyebrow">Requirement activity</p><h2>Review history</h2><p className="muted">A timeline of submissions, review decisions and updates for this brief.</p></div></div>{history.length ? <ol className="timeline-list requirement-history-timeline">{history.map((event, index) => { const Icon = actionIcon(event.action); return <li className="timeline-event" key={`${event.timestamp}-${index}`}><span className="timeline-marker" aria-hidden="true" /><div className="timeline-event-body"><div className="timeline-event-top"><div className="requirement-history-event-heading"><span className="requirement-history-icon"><Icon size={15} aria-hidden="true" /></span><div><h3>{actionLabel(event.action)}</h3><span className="muted">{formatDate(event.timestamp)}{event.actorName ? <> · {event.actorName}</> : null}</span></div></div></div></div></li>; })}</ol> : <div className="requirement-history-empty"><History size={20} aria-hidden="true" /><strong>No review activity yet</strong><span className="muted">Updates will appear here as the requirement is reviewed.</span></div>}</section>;
}
