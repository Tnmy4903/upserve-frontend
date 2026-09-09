import type { RequirementStatus } from '../types';
import { Check, Clock3, TriangleAlert } from 'lucide-react';

export function RequirementStatusBadge({ status }: { status: RequirementStatus }) {
  const label = status === 'CHANGES_REQUESTED' ? 'Changes requested' : status === 'APPROVED' ? 'Approved' : 'Pending';
  const Icon = status === 'APPROVED' ? Check : status === 'CHANGES_REQUESTED' ? TriangleAlert : Clock3;
  return <span className={`requirement-status requirement-status-${status.toLowerCase()}`}><Icon size={12} aria-hidden="true" />{label}</span>;
}
