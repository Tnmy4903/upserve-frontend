export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  entityId?: string | null;
  entityType?: string | null;
  eventKey?: string | null;
  read: boolean;
  createdAt: string;
}
