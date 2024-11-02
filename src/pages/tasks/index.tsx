import { useState, useEffect } from "react";
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
import { authStore } from "@/stores/AuthStore";

interface Filters {
  status: TaskStatus | "";
  priority: TaskPriority | "";
  department: number | "";
  startDate: Date | null;
  endDate: Date | null;
  search: string;
}

interface Department {
  id: number;
  name: string;
  parent: number | null;
  parent_name?: string;
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

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await client.get("/api/departments/");
      console.log("Departments response:", response.data);
      return response.data;
    },
  });

  const [filters, setFilters] = useState<Filters>(() => {
    console.log("Setting initial filters");
    console.log("Current user department:", authStore.user?.department);
    
    return {
      ...initialFilters,
      department: authStore.user?.department || "",
    };
  });

  useEffect(() => {
    if (authStore.user?.department) {
      console.log("Updating filters with user department:", authStore.user.department);
      setFilters(prev => ({
        ...prev,
        department: Number(authStore?.user?.department) 
      }));
    }
  }, []);

  const [page, setPage] = useState(1);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", filters, page],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.department !== "") {
        params.append("department", String(filters.department));
      }
      if (filters.startDate) {
        params.append("start_date", format(filters.startDate, "yyyy-MM-dd"));
      }
      if (filters.endDate) {
        params.append("end_date", format(filters.endDate, "yyyy-MM-dd"));
      }
      if (filters.search) params.append("search", filters.search);

      params.append("page", String(page));
      params.append("page_size", "10");
      params.append("ordering", "start_date");

      const url = `/api/tasks/?${params.toString()}`;
      console.log("Fetching tasks with URL:", url);
      
      try {
        const response = await client.get(url);
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    enabled: true,
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
    setFilters({
      ...initialFilters,
      department: authStore.user?.department || "",
    });
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
          <Typography variant="h5">회사 작업 리스트</Typography>
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
          currentUserDepartment={authStore.user?.department}
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
