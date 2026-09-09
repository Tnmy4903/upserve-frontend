import type { LeadStage } from '../types';
import { Check, Clock3, Send, X } from 'lucide-react';

export function LeadStatusBadge({ stage }: { stage: LeadStage }) {
  const Icon = stage === 'Won' ? Check : stage === 'Lost' ? X : stage === 'Proposal Sent' ? Send : Clock3;
  return <span className={`lead-status lead-status-${stage.toLowerCase().replaceAll(' ', '-')}`}><Icon size={12} aria-hidden="true" />{stage}</span>;
}
