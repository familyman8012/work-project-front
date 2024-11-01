export interface User {
  id: number;
  username: string;
  email: string;
  employee_id: string;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN";
  rank: string;
  department: number;
  department_name?: string;
  first_name?: string;
  last_name?: string;
}

export interface NotificationCount {
  count: number;
}
