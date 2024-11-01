import {
  Box,
  Typography,
  List,
  ListItem,
  CircularProgress,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { format } from "date-fns";

interface TaskHistory {
  id: number;
  task: number;
  changed_by: number;
  changed_by_name: string;
  previous_status: string;
  new_status: string;
  previous_assignee?: number;
  new_assignee?: number;
  previous_assignee_name?: string;
  new_assignee_name?: string;
  comment: string;
  created_at: string;
}

interface TaskHistoryProps {
  taskId: number;
}

export default function TaskHistory({ taskId }: TaskHistoryProps) {
  const { data: history = [], isLoading } = useQuery<TaskHistory[]>({
    queryKey: ["taskHistory", taskId],
    queryFn: async () => {
      try {
        const response = await client.get(`/api/task-history/?task=${taskId}`);
        return response.data.results || [];
      } catch (error) {
        console.error("History API Error:", error);
        return [];
      }
    },
  });

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      TODO: "할 일",
      IN_PROGRESS: "진행 중",
      REVIEW: "검토",
      DONE: "완료",
      HOLD: "보류",
    };
    return statusMap[status] || status;
  };

  const getHistoryMessage = (item: TaskHistory) => {
    if (item.previous_assignee && item.new_assignee) {
      return `담당자가 ${item.previous_assignee_name}에서 ${item.new_assignee_name}로 변경되었습니다.`;
    }
    return `상태가 ${getStatusText(item.previous_status)}에서 ${getStatusText(
      item.new_status
    )}로 변경되었습니다.`;
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
      <Typography variant="h6" gutterBottom>
        작업 히스토리
      </Typography>

      <List>
        {history.map((item) => (
          <ListItem
            key={item.id}
            sx={{
              flexDirection: "column",
              alignItems: "flex-start",
              borderLeft: "2px solid",
              borderLeftColor: "primary.main",
              pl: 2,
              py: 1,
              mb: 1,
            }}
          >
            <Typography variant="body2">{getHistoryMessage(item)}</Typography>
            {item.comment && (
              <Typography variant="body2" color="text.secondary">
                코멘트: {item.comment}
              </Typography>
            )}
            <Box
              display="flex"
              justifyContent="space-between"
              width="100%"
              mt={0.5}
            >
              <Typography variant="caption" color="text.secondary">
                변경자: {item.changed_by_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(item.created_at), "yyyy-MM-dd HH:mm")}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
