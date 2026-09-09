import { Link } from 'react-router-dom';
import type { Notification } from '../types';

const formatDate = (value: string) => new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const initials = (type: string) => type.slice(0, 2).toUpperCase();
export const notificationTarget = (item: Notification) => {
  if (!item.entityId) return null;
  const entity = (item.entityType || '').toLowerCase();
  if (entity.includes('project')) return `/app/projects/${item.entityId}`;
  if (entity.includes('quotation')) return `/app/quotations/${item.entityId}`;
  if (entity.includes('lead')) return `/app/leads/${item.entityId}`;
  if (entity.includes('requirement')) return `/app/requirements/${item.entityId}`;
  return null;
};

export function NotificationList({ items, busy, onRead, onDelete }: { items: Notification[]; busy: boolean; onRead: (item: Notification) => void; onDelete: (item: Notification) => void }) {
  return <div className="notification-list">{items.map(item => { const href = notificationTarget(item); return <article className={`notification-item ${item.read ? '' : 'notification-unread'}`} key={item.id} aria-label={`${item.read ? '' : 'Unread '}${item.title}`}><div className="notification-icon" aria-hidden="true">{initials(item.type)}</div><div className="notification-body"><div className="notification-item-heading"><h3>{item.title}</h3>{!item.read && <span className="notification-new">New</span>}</div><p>{item.message}</p><time className="muted" dateTime={item.createdAt}>{formatDate(item.createdAt)}</time><div className="notification-actions">{href && <Link className="text-button" to={href} onClick={() => { if (!item.read) onRead(item); }}>View related record</Link>}{!item.read && <button className="text-button" disabled={busy} onClick={() => onRead(item)}>Mark as read</button>}<button className="text-button danger-action" disabled={busy} onClick={() => onDelete(item)}>Delete</button></div></div></article>;})}</div>;
}
