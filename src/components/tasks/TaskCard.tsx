import { Task, TaskStatus } from "@/types/type";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  LinearProgress,
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

interface TaskCardProps {
  task: Task;
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

export default function TaskCard({ task }: TaskCardProps) {
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
                borderRadius: "4px"
              }}
            >
              <Person fontSize="small" />
              {task.assignee_full_name}
            </Typography>
          </Box>
          <Chip
            icon={<PriorityHigh />}
            label={task.priority}
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
            label={task.status}
            size="small"
            sx={{
              backgroundColor: getStatusColor(task.status),
              color: "white",
            }}
          />
          <Chip label={task.department_name} size="small" variant="outlined" />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <DateRange sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="body2">
              시작일: {formatDate(task.start_date)} ~ 마감일:{" "}
              {formatDate(task.due_date)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="body2">
              예상: {task.estimated_hours}시간
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="body2">
              실제: {task.actual_hours || 0}시간
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            진행률:
          </Typography>
          <Box sx={{ width: "100%" }}>
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
