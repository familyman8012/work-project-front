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

  // 오늘의 작업 목록 조회
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["todayTasks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const response = await client.get('/api/tasks/today_tasks/');
      return response.data;
    },
    enabled: !!user,
  });

  // 지연된 작업 목록 조회
  const { data: delayedTasks } = useQuery({
    queryKey: ["delayedTasks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const response = await client.get('/api/tasks/delayed_tasks/');
      return response.data;
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
          tasks.map((task: any) => <TaskCard key={task.id} task={task} showDates={true} />)
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
            <TaskCard key={task.id} task={task} showDates={true} />
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
