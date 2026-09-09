import type { ProjectStatus } from '../types';
import { CheckCheck, Clock3, Play, Send } from 'lucide-react';
export function ProjectStatusBadge({ status }: { status: ProjectStatus }) { const Icon = status === 'completed' ? CheckCheck : status === 'delivered' ? Send : status === 'pending' ? Clock3 : Play; return <span className={`status-badge status-${status}`}><Icon size={12} aria-hidden="true" />{status.replace('_', ' ')}</span>; }
