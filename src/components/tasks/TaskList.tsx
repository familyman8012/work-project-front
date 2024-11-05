import { Task } from "@/types/type";
import { Box, Pagination, Typography } from "@mui/material";
import TaskCard from "./TaskCard";
import { authStore } from "@/stores/AuthStore";

interface TaskListProps {
  tasks: {
    count: number;
    results: Task[];
  };
  page: number;
  onPageChange: (page: number) => void;
}

// 작업 접근 권한 체크 함수
const canAccessTask = (task: Task) => {
  const user = authStore.user;
  if (!user) return false;

  // ADMIN은 모든 작업 접근 가능
  if (user.role === "ADMIN") return true;

  // DIRECTOR/GENERAL_MANAGER는 본부 내 모든 작업 접근 가능
  if (user.rank === "DIRECTOR" || user.rank === "GENERAL_MANAGER") {
    return (
      user.department === task.department ||
      task.department_parent_id === user.department
    );
  }

  // MANAGER는 팀 내 작업만 접근 가능
  if (user.role === "MANAGER") {
    return task.department === user.department;
  }

  // EMPLOYEE는 자신의 작업만 접근 가능
  return task.assignee === user.id;
};

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
          <TaskCard
            key={task.id}
            task={task}
            showDates={true}
            clickable={canAccessTask(task)} // 접근 권한에 따라 클릭 가능 여부 설정
          />
        ))}
      </Box>

      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 3,
            mb: 2,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => onPageChange(value)}
            color="primary"
            showFirstButton
            showLastButton
            size="large"
          />
        </Box>
      )}

      <Box sx={{ textAlign: "center", mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          전체 {tasks.count}개 중 {(page - 1) * 10 + 1}-
          {Math.min(page * 10, tasks.count)}개 표시
        </Typography>
      </Box>
    </Box>
  );
}
