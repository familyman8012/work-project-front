import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Typography, CircularProgress, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { format } from "date-fns";
import { withAuth } from "@/components/auth/withAuth";
import Layout from "@/components/layout/Layout";
import Calendar from "@/components/schedule/Calendar";
import { client } from "@/lib/api/client";
import { CalendarTask } from "@/types/schedule";
import { authStore } from "@/stores/AuthStore";

type ViewScope = "MY" | "DEPARTMENT";

function SchedulePage() {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(),
  });
  const [viewScope, setViewScope] = useState<ViewScope>("MY");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["calendar-tasks", dateRange, viewScope],
    queryFn: async () => {
      const params = {
        start_date: format(dateRange.start, "yyyy-MM-dd"),
        end_date: format(dateRange.end, "yyyy-MM-dd"),
        ...(viewScope === "MY" 
          ? { assignee: authStore.user?.id }
          : { department: authStore.user?.department }
        ),
      };
      
      const response = await client.get("/api/tasks/calendar/", { params });
      return response.data as CalendarTask[];
    },
  });

  const updateDatesMutation = useMutation({
    mutationFn: async ({
      taskId,
      start,
      end,
    }: {
      taskId: number;
      start: Date;
      end: Date;
    }) => {
      const response = await client.post(`/api/tasks/${taskId}/update_dates/`, {
        start_date: format(start, "yyyy-MM-dd'T'HH:mm:ssXXX"),
        due_date: format(end, "yyyy-MM-dd'T'HH:mm:ssXXX"),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-tasks"] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || "일정 변경에 실패했습니다.");
    },
  });

  const handleRangeChange = useCallback((start: Date, end: Date) => {
    setDateRange({ start, end });
  }, []);

  const handleEventDrop = useCallback(
    (taskId: number, start: Date, end: Date) => {
      updateDatesMutation.mutate({ taskId, start, end });
    },
    [updateDatesMutation]
  );

  const handleScopeChange = (
    event: React.MouseEvent<HTMLElement>,
    newScope: ViewScope
  ) => {
    if (newScope !== null) {
      setViewScope(newScope);
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5">일정 관리</Typography>
          <ToggleButtonGroup
            value={viewScope}
            exclusive
            onChange={handleScopeChange}
            size="small"
          >
            <ToggleButton value="MY">내 작업</ToggleButton>
            <ToggleButton value="DEPARTMENT">부서 작업</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Calendar
            tasks={tasks || []}
            onRangeChange={handleRangeChange}
            onEventDrop={handleEventDrop}
            isLoading={isLoading}
          />
        )}
      </Box>
    </Layout>
  );
}

export default withAuth(SchedulePage);
