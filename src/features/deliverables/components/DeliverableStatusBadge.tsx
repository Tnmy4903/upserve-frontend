import type { DeliverableStatus } from '../types';
import { CheckCheck, Clock3, Play, TriangleAlert, X } from 'lucide-react';
export function DeliverableStatusBadge({ status }: { status: DeliverableStatus }) { const Icon = status === 'completed' ? CheckCheck : status === 'cancelled' ? X : status === 'blocked' ? TriangleAlert : status === 'in_progress' ? Play : Clock3; return <span className={`status-badge deliverable-status-${status}`}><Icon size={12} aria-hidden="true" />{status.replace('_', ' ')}</span>; }
