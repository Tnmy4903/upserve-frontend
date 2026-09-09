import type { ActivityLog } from '../types';
import { UserIdentity } from '../../../components/UserIdentity';
import { ActivityEntityIdentity } from './ActivityEntityIdentity';
import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown time' : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

const label = (value: string) => value.replace(/[_-]/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, character => character.toUpperCase());
const summary = (item: ActivityLog) => {
  const details = item.details || {};
  const project = typeof details.projectTitle === 'string' ? details.projectTitle : typeof details.title === 'string' ? details.title : '';
  const invoice = typeof details.invoiceNumber === 'string' ? details.invoiceNumber : '';
  if (project) return `${label(item.action)} - ${project}`;
  if (invoice) return `${label(item.action)} - ${invoice}`;
  return label(item.action);
};

export function ActivityLogTable({ items, onSelect }: { items: ActivityLog[]; onSelect: (item: ActivityLog) => void }) {
  const [direction, setDirection] = useState<'asc'|'desc'>('desc'); const sorted = useMemo(() => [...items].sort((a,b) => { const result = a.timestamp.localeCompare(b.timestamp); return direction === 'asc' ? result : -result; }), [items, direction]);
  return <div className="table-wrap activity-log-table-wrap"><table className="activity-log-table"><thead><tr><th>Event</th><th>Actor</th><th>Entity</th><th><button type="button" className="table-sort" onClick={() => setDirection(current => current === 'asc' ? 'desc' : 'asc')}>When {direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</button></th><th><span className="sr-only">View</span></th></tr></thead><tbody>{sorted.map(item => <tr key={item.id}>
    <td data-label="Event"><strong>{summary(item)}</strong><small>{item.entity}</small></td>
    <td data-label="Actor"><strong>{item.actorName || <UserIdentity id={item.userId} fallback="System" />}</strong><small><span className="activity-role">{label(item.userRole)}</span></small><small className="activity-id">{item.userId}</small></td>
    <td data-label="Entity"><strong><ActivityEntityIdentity entity={item.entity} id={item.entityId} /></strong><small>{label(item.entity)}</small><small className="activity-id">{item.entityId}</small></td>
    <td data-label="When"><time dateTime={item.timestamp}>{formatDate(item.timestamp)}</time></td>
    <td data-label="Action"><button className="text-button" onClick={() => onSelect(item)}>View details</button></td>
  </tr>)}</tbody></table></div>;
}
