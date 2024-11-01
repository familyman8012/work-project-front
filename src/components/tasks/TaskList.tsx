import { Task } from "@/types/type";
import { Box, Pagination, Typography } from "@mui/material";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: {
    count: number;
    results: Task[];
  };
  page: number;
  onPageChange: (page: number) => void;
}

export default function TaskList({ tasks, page, onPageChange }: TaskListProps) {
  if (!tasks?.results) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="text.secondary">
          데이터를 불러오는 중입니다...
        </Typography>
      </Box>
    );
  }

  if (tasks.results.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="text.secondary">표시할 작업이 없습니다.</Typography>
      </Box>
    );
  }

  const totalPages = Math.ceil(tasks.count / 10);

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        {tasks.results.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </Box>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => onPageChange(value)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
