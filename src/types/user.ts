export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  employee_id: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  rank:
    | "STAFF"
    | "SENIOR"
    | "ASSISTANT_MANAGER"
    | "MANAGER"
    | "DEPUTY_GENERAL_MANAGER"
    | "GENERAL_MANAGER"
    | "DIRECTOR";
  department: {
    id: number;
    name: string;
    code: string;
    parent_id: number | null;
  };
  department_name: string;
}

export interface NotificationCount {
  count: number;
}
