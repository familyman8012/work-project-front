import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
} from "@mui/material";
import { Assignment, Warning } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { format } from "date-fns";
import Link from "next/link";

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  due_date: string;
  is_delayed: boolean;
}

const TodayTasksCard = () => {
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["todayTasks"],
    queryFn: async () => {
      const response = await client.get("/api/tasks/", {
        params: {
          due_date_before: `${today}T23:59:59`,
          status_not: "DONE",
        },
      });
      return response.data.results as Task[];
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "error";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "info";
      case "LOW":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "TODO":
        return "예정";
      case "IN_PROGRESS":
        return "진행중";
      case "REVIEW":
        return "검토중";
      case "HOLD":
        return "보류";
      default:
        return status;
    }
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Assignment sx={{ fontSize: 40, mr: 2, color: "primary.main" }} />
          <Typography variant="h5" component="div">
            오늘의 작업
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {isLoading ? (
          <Typography>로딩중...</Typography>
        ) : !tasks?.length ? (
          <Typography color="text.secondary">
            오늘 처리할 작업이 없습니다.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {tasks.map((task) => (
              <Link
                href={`/tasks/${task.id}`}
                key={task.id}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                    cursor: "pointer",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" component="div">
                      {task.title}
                    </Typography>
                    {task.is_delayed && <Warning color="error" />}
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Chip
                      label={getStatusText(task.status)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority) as any}
                    />
                  </Box>
                </Card>
              </Link>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayTasksCard;
