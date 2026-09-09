export interface TimelineEvent {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  createdBy: string;
  createdAt: string;
  eventType?: string | null;
  clientVisible: boolean;
  isSystemEvent: boolean;
  isDeleted: boolean;
}

export interface TimelineEventPayload {
  title: string;
  description?: string;
  clientVisible: boolean;
}
