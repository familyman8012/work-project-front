import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";
import { client } from "@/lib/api/client";
import TaskCard from "../tasks/TaskCard";
import { authStore } from "@/stores/AuthStore";
import { format } from "date-fns";

export default function TodayTasksCard() {
  const user = authStore.user;

  // 사용자의 권한과 직급에 따른 필터 파라미터 설정
  const getFilterParams = (isDelayed = false) => {
    const params = new URLSearchParams();
    const today = format(new Date(), "yyyy-MM-dd");

    if (!isDelayed) {
      // 수정: 시작일이 오늘보다 이전이고, 종료일이 오늘보다 이후인 작업을 찾음
      params.append("start_date_before", today); // 시작일이 오늘 이전인 작업
      params.append("due_date_after", today); // 종료일이 오늘 이후인 작업
    }

    if (!user) return params;

    if (user.role === "ADMIN") {
      return params;
    }

    if (user.rank === "DIRECTOR" || user.rank === "GENERAL_MANAGER") {
      const departmentId = user.department?.id;
      if (departmentId) {
        params.append("department", departmentId.toString());
      }
    } else if (user.role === "MANAGER") {
      const departmentId = user.department?.id;
      if (departmentId) {
        params.append("department", departmentId.toString());
      }
    } else {
      params.append("assignee", user.id.toString());
    }

    return params;
  };

  // 작업 목록 조회
  const { data: tasks, isLoading } = useQuery({
    queryKey: [
      "todayTasks",
      user?.id,
      user?.role,
      user?.rank,
      user?.department?.id,
    ],
    queryFn: async () => {
      if (!user) return [];
      const params = getFilterParams(false);
      params.append("ordering", "start_date");
      console.log("Today tasks params:", params.toString());
      const response = await client.get(`/api/tasks/?${params.toString()}`);
      console.log("Today tasks response:", response.data);
      return response.data.results;
    },
    enabled: !!user,
  });

  // 지연된 작업 목록 조회
  const { data: delayedTasks } = useQuery({
    queryKey: [
      "delayedTasks",
      user?.id,
      user?.role,
      user?.rank,
      user?.department?.id,
    ],
    queryFn: async () => {
      if (!user) return [];
      const params = getFilterParams(true);
      params.append("is_delayed", "true");
      params.append("ordering", "start_date");
      console.log("Delayed tasks params:", params.toString());
      const response = await client.get(`/api/tasks/?${params.toString()}`);
      console.log("Delayed tasks response:", response.data);
      return response.data.results;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          관리 중인 오늘의 작업 ({tasks?.length || 0})
        </Typography>
        {tasks?.length > 0 ? (
          tasks.map((task: any) => <TaskCard key={task.id} task={task} />)
        ) : (
          <Typography color="text.secondary">
            오늘 예정된 작업이 없습니다.
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom color="error">
          관리 중인 지연된 작업 ({delayedTasks?.length || 0})
        </Typography>
        {delayedTasks?.length > 0 ? (
          delayedTasks.map((task: any) => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <Typography color="text.secondary">
            지연된 작업이 없습니다.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
