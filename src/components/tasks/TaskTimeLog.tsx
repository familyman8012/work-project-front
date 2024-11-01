import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { PlayArrow, Stop, Delete } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { ko } from "date-fns/locale";

interface TimeLog {
  id: number;
  task: number;
  start_time: string;
  end_time: string | null;
  duration: string;
  logged_by: number;
  logged_by_name: string;
}

interface TaskTimeLogProps {
  taskId: number;
}

export default function TaskTimeLog({ taskId }: TaskTimeLogProps) {
  const [deleteLogId, setDeleteLogId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // 시간 기록 목록 조회
  const { data: timeLogsData, isLoading } = useQuery<{ results: TimeLog[] }>({
    queryKey: ["taskTimeLogs", taskId],
    queryFn: async () => {
      try {
        const response = await client.get(
          `/api/task-time-logs/?task=${taskId}`
        );
        console.log("Time Logs Response:", response.data); // 디버깅용
        return response.data;
      } catch (error) {
        console.error("Time Logs API Error:", error);
        return { results: [] };
      }
    },
    refetchInterval: 1000 * 60, // 1분마다 갱신
  });

  const timeLogs = timeLogsData?.results || [];

  // 현재 진행중인 시간 기록 찾기
  const activeTimeLog = timeLogs.find((log) => !log.end_time);

  // 시간 기록 시작
  const startTimeLogMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await client.post("/api/task-time-logs/", {
          task: taskId,
          start_time: new Date().toISOString(),
        });
        console.log("Start Time Log Response:", response.data); // 디버깅용
        return response.data;
      } catch (error) {
        console.error("Start Time Log Error:", error); // 디버깅용
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskTimeLogs", taskId] });
    },
    onError: (error: any) => {
      console.error("Start Time Log Error:", error);
      alert("시간 기록 시작에 실패했습니다.");
    },
  });

  // 시간 기록 종료
  const endTimeLogMutation = useMutation({
    mutationFn: async (logId: number) => {
      try {
        const response = await client.patch(`/api/task-time-logs/${logId}/`, {
          end_time: new Date().toISOString(),
        });
        console.log("End Time Log Response:", response.data); // 디버깅용
        return response.data;
      } catch (error) {
        console.error("End Time Log Error:", error); // 디버깅용
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskTimeLogs", taskId] });
    },
    onError: (error: any) => {
      console.error("End Time Log Error:", error);
      alert("시간 기록 종료에 실패했습니다.");
    },
  });

  // 시간 기록 삭제
  const deleteTimeLogMutation = useMutation({
    mutationFn: async (logId: number) => {
      await client.delete(`/api/task-time-logs/${logId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskTimeLogs", taskId] });
      setDeleteLogId(null);
    },
  });

  const handleStartTimeLog = () => {
    startTimeLogMutation.mutate();
  };

  const handleEndTimeLog = (logId: number) => {
    endTimeLogMutation.mutate(logId);
  };

  const handleDeleteClick = (logId: number) => {
    setDeleteLogId(logId);
  };

  const handleDeleteConfirm = () => {
    if (deleteLogId) {
      deleteTimeLogMutation.mutate(deleteLogId);
    }
  };

  const formatTimeLogDuration = (duration: string) => {
    const [hours, minutes] = duration.split(":");
    return `${hours}시간 ${minutes}분`;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h6">작업 시간 기록</Typography>
        <Button
          variant="contained"
          startIcon={activeTimeLog ? <Stop /> : <PlayArrow />}
          onClick={() =>
            activeTimeLog
              ? handleEndTimeLog(activeTimeLog.id)
              : handleStartTimeLog()
          }
          color={activeTimeLog ? "error" : "primary"}
        >
          {activeTimeLog ? "기록 종료" : "기록 시작"}
        </Button>
      </Box>

      <List>
        {timeLogs.length === 0 ? (
          <Typography color="text.secondary" align="center">
            기록된 작업 시간이 없습니다.
          </Typography>
        ) : (
          timeLogs.map((log) => (
            <ListItem
              key={log.id}
              sx={{
                bgcolor: !log.end_time ? "action.selected" : "transparent",
                borderRadius: 1,
                mb: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                p: 2,
              }}
            >
              <Box width="100%" display="flex" justifyContent="space-between">
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(log.start_time), "yyyy-MM-dd HH:mm")} ~{" "}
                    {log.end_time
                      ? format(new Date(log.end_time), "HH:mm")
                      : "진행중"}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {log.end_time
                      ? formatTimeLogDuration(log.duration)
                      : "시간 측정중..."}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    기록: {log.logged_by_name}
                  </Typography>
                </Box>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteClick(log.id)}
                  sx={{ alignSelf: "flex-start" }}
                >
                  <Delete />
                </IconButton>
              </Box>
            </ListItem>
          ))
        )}
      </List>

      <Dialog open={deleteLogId !== null} onClose={() => setDeleteLogId(null)}>
        <DialogTitle>시간 기록 삭제</DialogTitle>
        <DialogContent>
          <Typography>이 시간 기록을 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteLogId(null)}>취소</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleteTimeLogMutation.isPending}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
