export interface Notification {
  id: number;
  recipient: number;
  recipient_name: string;
  notification_type: string;
  task: number;
  task_title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
