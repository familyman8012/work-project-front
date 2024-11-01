import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, CircularProgress } from "@mui/material";
import { withAuth } from "@/components/auth/withAuth";
import Layout from "@/components/layout/Layout";
import { client } from "@/lib/api/client";
import { format } from "date-fns";
import { authStore } from "@/stores/AuthStore";
import TaskList from "@/components/tasks/TaskList";
import { TaskStatus, TaskPriority } from "@/types/type";
import TaskFilters from "@/components/tasks/TaskFilters";

interface Filters {
  status: TaskStatus | "";
  priority: TaskPriority | "";
  startDate: Date | null;
  endDate: Date | null;
  search: string;
}

const initialFilters: Filters = {
  status: "",
  priority: "",
  startDate: null,
  endDate: null,
  search: "",
};

function MyTasksPage() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const userId = authStore.user?.id;

  // 작업 목록 조회
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["myTasks", filters, page, userId],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.startDate)
        params.append(
          "start_date_after",
          format(filters.startDate, "yyyy-MM-dd")
        );
      if (filters.endDate)
        params.append("due_date_before", format(filters.endDate, "yyyy-MM-dd"));
      if (filters.search) params.append("search", filters.search);

      // 현재 로그인한 사용자의 작업만 필터링
      params.append("assignee", String(userId));
      params.append("page", String(page));
      params.append("page_size", "10");

      const response = await client.get(`/api/tasks/?${params.toString()}`);
      return response.data;
    },
    enabled: !!userId,
  });

  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1); // 필터 변경 시 첫 페이지로 이동
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          내 작업
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TaskFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            onClearFilters={handleClearFilters}
            hideFilters={["department"]} // 부서 필터 숨김
          />
        </Box>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : tasks ? (
          <TaskList tasks={tasks} page={page} onPageChange={handlePageChange} />
        ) : null}
      </Box>
    </Layout>
  );
}

export default withAuth(MyTasksPage);
