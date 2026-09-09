export type ActivityLogDetails = Record<string, unknown>;

export type ActivityLog = {
  id: string;
  userId: string;
  userRole: string;
  actorName?: string | null;
  action: string;
  entity: string;
  entityId: string;
  details: ActivityLogDetails;
  timestamp: string;
};

export type ActivityLogScope = 'all' | 'user' | 'entity';
