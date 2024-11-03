export interface DashboardStats {
  totalTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  delayedTasks: number;
}

export interface WorkloadStats {
  date: string;
  total: number;
  completed: number;
  inProgress: number;
  delayed: number;
}

export interface PriorityStats {
  priority: string;
  count: number;
  percentage: number;
}

export interface Activity {
  id: number;
  type: string;
  description: string;
  created_at: string;
  task_id: number;
  task_title: string;
}

export interface DeadlineTask {
  id: number;
  title: string;
  due_date: string;
  priority: string;
  status: string;
}

export interface TeamMemberPerformance {
  user_id: number;
  name: string;
  completion_rate: number;
  task_count: number;
  average_score: number;
  my_completion_time?: string;
  my_score?: number;
  relative_efficiency?: number;
}

export interface TeamPerformanceData {
  members: TeamMemberPerformance[];
} 