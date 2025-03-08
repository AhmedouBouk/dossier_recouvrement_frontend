export interface HistoryEvent {
  id?: number;
  timestamp: Date;
  username: string;
  action: string;
  entityType: string;
  entityId?: string | number;
  entityName?: string;
  details?: string;
}
