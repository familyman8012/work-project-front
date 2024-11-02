export interface User {
  id: number;
  username: string;
  email: string;
  employee_id: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  rank:
    | "DIRECTOR"
    | "GENERAL_MANAGER"
    | "MANAGER"
    | "STAFF"
    | "SENIOR"
    | "ASSISTANT_MANAGER"
    | "DEPUTY_GENERAL_MANAGER";
  department: number;
  department_name: string;
  first_name: string;
  last_name: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "HOLD";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignee: number;
  assignee_name: string;
  assignee_full_name: string;
  reporter: number;
  reporter_name: string;
  department: number;
  department_name: string;
  start_date: string;
  due_date: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  estimated_hours: number;
  actual_hours?: number;
  difficulty: "LOW" | "MEDIUM" | "HIGH";
  is_delayed: boolean;
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "HOLD";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskDifficulty = "LOW" | "MEDIUM" | "HIGH";
