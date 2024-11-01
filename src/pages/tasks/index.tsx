import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { withAuth } from "@/components/auth/withAuth";
import Layout from "@/components/layout/Layout";
import TaskFilters from "@/components/tasks/TaskFilters";
import { client } from "@/lib/api/client";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { Add as AddIcon } from "@mui/icons-material";

import TaskList from "@/components/tasks/TaskList";
import { TaskStatus } from "@/types/type";
import { TaskPriority } from "@/types/type";

interface Filters {
  status: TaskStatus | "";
  priority: TaskPriority | "";
  department: number | "";
  startDate: Date | null;
  endDate: Date | null;
  search: string;
}

const initialFilters: Filters = {
  status: "",
  priority: "",
  department: "",
  startDate: null,
  endDate: null,
  search: "",
};

function TasksPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);

  // 부서 목록 조회
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await client.get("/api/departments/");
      return response.data;
    },
  });

  // 작업 목록 조회
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", filters, page],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.department)
        params.append("department", String(filters.department));
      if (filters.startDate)
        params.append(
          "start_date_after",
          format(filters.startDate, "yyyy-MM-dd")
        );
      if (filters.endDate)
        params.append("due_date_before", format(filters.endDate, "yyyy-MM-dd"));
      if (filters.search) params.append("search", filters.search);

      params.append("page", String(page));
      params.append("page_size", "10");

      try {
        const response = await client.get(`/api/tasks/?${params.toString()}`);
        console.log("API Response:", response.data); // 디버깅용 로그
        return response.data;
      } catch (error) {
        console.error("API Error:", error); // 디버깅용 로그
        throw error;
      }
    },
  });

  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5">작업 목록</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/tasks/create")}
          >
            새 작업
          </Button>
        </Box>

        <TaskFilters
          filters={filters}
          departments={departments}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          onClearFilters={handleClearFilters}
        />

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

export default withAuth(TasksPage);
