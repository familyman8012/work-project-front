import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { withAuth } from "@/components/auth/withAuth";
import Layout from "@/components/layout/Layout";
import { client } from "@/lib/api/client";
import { Task, TaskStatus, TaskPriority, TaskDifficulty } from "@/types/type";
import { format } from "date-fns";
import TaskComments from "@/components/tasks/TaskComments";
import TaskTimeLog from "@/components/tasks/TaskTimeLog";
import TaskHistory from "@/components/tasks/TaskHistory";

function TaskDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 작업 상세 정보 조회
  const { data: task, isLoading } = useQuery<Task>({
    queryKey: ["task", id],
    queryFn: async () => {
      const response = await client.get(`/api/tasks/${id}/`);
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 1000 * 30, // 30초마다 갱신
  });

  // 작업 수정 mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: Partial<Task>) => {
      const response = await client.patch(`/api/tasks/${id}/`, updatedTask);
      return response.data;
    },
    onSuccess: () => {
      // 작업 정보와 히스토리를 함께 갱신
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["task", id] }),
        queryClient.invalidateQueries({ queryKey: ["taskHistory", id] }),
      ]);
      setEditMode(false);
      setError(null);
    },
    onError: (error: any) => {
      setError(
        error.response?.data?.detail || "작업 수정 중 오류가 발생했습니다."
      );
    },
  });

  const handleStatusChange = async (newStatus: TaskStatus) => {
    await updateTaskMutation.mutateAsync({ status: newStatus });
  };

  const handlePriorityChange = (newPriority: TaskPriority) => {
    updateTaskMutation.mutate({ priority: newPriority });
  };

  const handleActualHoursChange = (hours: number) => {
    updateTaskMutation.mutate({ actual_hours: hours });
  };

  const handleDifficultyChange = (difficulty: TaskDifficulty) => {
    updateTaskMutation.mutate({ difficulty });
  };

  const handleAssigneeChange = async (newAssignee: number) => {
    await updateTaskMutation.mutateAsync({ assignee: newAssignee });
  };

  if (isLoading) {
    return (
      <Layout>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <Box p={3}>
          <Alert severity="error">작업을 찾을 수 없습니다.</Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box p={3}>
        <Paper sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                {task.title}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>상태</InputLabel>
                <Select
                  value={task.status}
                  label="상태"
                  onChange={(e) =>
                    handleStatusChange(e.target.value as TaskStatus)
                  }
                >
                  <MenuItem value="TODO">할 일</MenuItem>
                  <MenuItem value="IN_PROGRESS">진행 중</MenuItem>
                  <MenuItem value="REVIEW">검토</MenuItem>
                  <MenuItem value="DONE">완료</MenuItem>
                  <MenuItem value="HOLD">보류</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>우선순위</InputLabel>
                <Select
                  value={task.priority}
                  label="우선순위"
                  onChange={(e) =>
                    handlePriorityChange(e.target.value as TaskPriority)
                  }
                >
                  <MenuItem value="LOW">낮음</MenuItem>
                  <MenuItem value="MEDIUM">중간</MenuItem>
                  <MenuItem value="HIGH">높음</MenuItem>
                  <MenuItem value="URGENT">긴급</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                설명
              </Typography>
              <Typography color="text.secondary">{task.description}</Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2">담당자</Typography>
              <Typography color="text.secondary">
                {task.assignee_name}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2">시작일</Typography>
              <Typography color="text.secondary">
                {format(new Date(task.start_date), "yyyy-MM-dd")}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2">마감일</Typography>
              <Typography color="text.secondary">
                {format(new Date(task.due_date), "yyyy-MM-dd")}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="실제 소요 시간"
                value={task.actual_hours || ""}
                onChange={(e) =>
                  handleActualHoursChange(Number(e.target.value))
                }
                InputProps={{ inputProps: { min: 0, step: 0.5 } }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>난이도</InputLabel>
                <Select
                  value={task.difficulty}
                  label="난이도"
                  onChange={(e) =>
                    handleDifficultyChange(e.target.value as TaskDifficulty)
                  }
                >
                  <MenuItem value="LOW">쉬움</MenuItem>
                  <MenuItem value="MEDIUM">보통</MenuItem>
                  <MenuItem value="HIGH">어려움</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <TaskTimeLog taskId={Number(id)} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <TaskHistory taskId={Number(id)} />
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <TaskComments taskId={task.id} />
      </Box>
    </Layout>
  );
}

export default withAuth(TaskDetailPage);