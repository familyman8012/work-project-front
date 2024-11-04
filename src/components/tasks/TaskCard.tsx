import { Task, TaskStatus } from "@/types/type";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  LinearProgress,
  Grid,
} from "@mui/material";
import {
  AccessTime,
  PriorityHigh,
  Flag,
  Schedule,
  DateRange,
  Person,
} from "@mui/icons-material";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  getTaskStatusText,
  getTaskPriorityText,
  getTaskDifficultyText,
} from "@/lib/getTaskStatusText";

interface TaskCardProps {
  task: any;
  showDates?: boolean;
  showScore?: boolean;
}

const getStatusColor = (status: TaskStatus) => {
  const colors: Record<TaskStatus, string> = {
    TODO: "#9e9e9e",
    IN_PROGRESS: "#1976d2",
    REVIEW: "#ed6c02",
    DONE: "#2e7d32",
    HOLD: "#d32f2f",
  };
  return colors[status];
};

const getPriorityColor = (priority: string) => {
  const colors = {
    LOW: "#9e9e9e",
    MEDIUM: "#ed6c02",
    HIGH: "#d32f2f",
    URGENT: "#9c27b0",
  };
  return colors[priority as keyof typeof colors] || "#9e9e9e";
};

export default function TaskCard({
  task,
  showDates,
  showScore,
}: TaskCardProps) {
  const router = useRouter();
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "M월 d일", { locale: ko });
  };
  const completionRate = task.actual_hours
    ? (task.actual_hours / task.estimated_hours) * 100
    : 0;

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: 4,
        borderColor: getStatusColor(task.status),
        cursor: "pointer",
        "&:hover": {
          boxShadow: 6,
        },
      }}
      onClick={() => router.push(`/tasks/${task.id}`)}
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" component="div">
              {task.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                ml: 2,
                backgroundColor: "action.hover",
                padding: "4px 8px",
                borderRadius: "4px",
              }}
            >
              <Person fontSize="small" />
              {task.assignee_full_name}
            </Typography>
          </Box>
          <Chip
            icon={<PriorityHigh />}
            label={getTaskPriorityText(task.priority)}
            size="small"
            sx={{
              backgroundColor: getPriorityColor(task.priority),
              color: "white",
            }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          <Chip
            icon={<Flag />}
            label={getTaskStatusText(task.status)}
            size="small"
            sx={{
              backgroundColor: getStatusColor(task.status),
              color: "white",
            }}
          />
          <Chip label={task.department_name} size="small" variant="outlined" />
        </Box>

        <Grid container spacing={2} alignItems="center">
          {showDates && (
            <Grid item xs={12} sm={12}>
              <Typography variant="body2" color="text.secondary">
                {format(new Date(task.start_date), "yyyy-MM-dd")} ~
                {task.completed_at
                  ? format(new Date(task.completed_at), "yyyy-MM-dd")
                  : format(new Date(task.due_date), "yyyy-MM-dd")}
              </Typography>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              예상 시간: {task.estimated_hours}시간{" "}
              {task.actual_hours && ` / 실제 시간: ${task.actual_hours}시간`}
              {showScore && task.evaluation && (
                <Chip
                  size="small"
                  label={`${task.evaluation.performance_score}점`}
                  color={
                    task.evaluation.performance_score >= 4
                      ? "success"
                      : "default"
                  }
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
          </Grid>
          {task.actual_hours && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary"></Typography>
            </Grid>
          )}
        </Grid>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            진행률:
          </Typography>
          <Box sx={{ width: "80%" }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(completionRate, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {Math.min(completionRate, 100).toFixed(0)}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
