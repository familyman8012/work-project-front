export interface CalendarTask {
  id: number;
  title: string;
  start_date: string;
  due_date: string;
  status: string;
  priority: string;
  is_milestone: boolean;
  assignee: number;
  is_delayed: boolean;
  color?: string;
  textColor?: string;
  progress: number;
}

export interface WorkloadData {
  user_id: number;
  user_name: string;
  tasks_count: number;
}

export type ViewType = "month" | "week" | "day";
