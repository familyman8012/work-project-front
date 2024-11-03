import { Box, Typography, List, ListItem, ListItemText, Chip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { format, differenceInDays } from "date-fns";
import { useRouter } from "next/router";

interface DeadlineTask {
  id: number;
  title: string;
  due_date: string;
  priority: string;
  status: string;
}

export default function UpcomingDeadlines() {
  const router = useRouter();
  const { data: tasks } = useQuery({
    queryKey: ["upcomingDeadlines"],
    queryFn: async () => {
      const response = await client.get("/api/tasks/upcoming-deadlines/");
      return response.data;
    }
  });

  const getUrgencyColor = (dueDate: string) => {
    const daysUntilDue = differenceInDays(new Date(dueDate), new Date());
    if (daysUntilDue <= 1) return 'error';
    if (daysUntilDue <= 3) return 'warning';
    return 'success';
  };

  const getDaysText = (dueDate: string) => {
    const days = differenceInDays(new Date(dueDate), new Date());
    if (days === 0) return '오늘 마감';
    if (days === 1) return '내일 마감';
    return `${days}일 남음`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        다가오는 마감일
      </Typography>
      <List>
        {tasks?.map((task: DeadlineTask) => (
          <ListItem 
            key={task.id}
            onClick={() => router.push(`/tasks/${task.id}`)}
            sx={{ 
              cursor: 'pointer',
              mb: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 1,
              '&:hover': {
                bgcolor: 'action.hover',
              },
              transition: 'all 0.2s'
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="body1">
                    {task.title}
                  </Typography>
                  <Chip 
                    label={getDaysText(task.due_date)}
                    size="small"
                    color={getUrgencyColor(task.due_date)}
                    sx={{ ml: 'auto' }}
                  />
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    마감일: {format(new Date(task.due_date), "yyyy-MM-dd")}
                  </Typography>
                  <Chip 
                    label={task.status}
                    size="small"
                    variant="outlined"
                    sx={{ ml: 'auto' }}
                  />
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
} 