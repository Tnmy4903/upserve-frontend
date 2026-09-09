export const leadStages = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
] as const;

export type LeadStage = (typeof leadStages)[number];

export interface Lead {
  id: string;
  email: string;
  companyName?: string | null;
  contactPerson: string;
  phone?: string | null;
  business: string;
  leadSource?: string | null;
  notes?: string | null;
  stage: LeadStage;
  assignedTo?: string | null;
  assignedToIds?: string[];
  clientId?: string | null;
  createdAt: string;
  updatedAt: string;
  accountStatus?: 'created' | 'existing' | 'already_linked' | null;
  emailStatus?: 'sent' | 'failed' | 'not_attempted' | null;
  emailMessage?: string | null;
}

export interface LeadCreate {
  email: string;
  companyName?: string;
  contactPerson: string;
  phone?: string;
  business: string;
  leadSource?: string;
  notes?: string;
}

export interface LeadUpdate {
  email?: string;
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  business?: string;
  leadSource?: string;
  stage?: LeadStage;
  notes?: string;
}

export interface LeadHistoryEvent {
  action: string;
  field?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  message?: string | null;
  changedBy: string;
  timestamp: string;
}
