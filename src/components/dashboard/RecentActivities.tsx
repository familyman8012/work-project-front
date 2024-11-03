import { Box, Typography, List, ListItem, ListItemText, Chip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { Activity } from "@/types/dashboard";
import { format } from "date-fns";

export default function RecentActivities() {
  const { data: activities } = useQuery({
    queryKey: ["recentActivities"],
    queryFn: async () => {
      const response = await client.get("/api/tasks/recent/");
      return response.data;
    }
  });

  const getActivityTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      TASK_CREATED: "작업 생성",
      TASK_UPDATED: "작업 수정",
      TASK_COMPLETED: "작업 완료",
      COMMENT_ADDED: "코멘트 추가",
      STATUS_CHANGED: "상태 변경"
    };
    return types[type] || type;
  };

  const recentActivities = activities?.slice(0, 5);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        최근 활동
      </Typography>
      <List>
        {recentActivities?.map((activity: Activity) => (
          <ListItem 
            key={activity.id}
            sx={{ 
              borderLeft: '2px solid',
              borderLeftColor: 'primary.main',
              mb: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 1
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Chip 
                    label={getActivityTypeText(activity.type)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(activity.created_at), "MM/dd HH:mm")}
                  </Typography>
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {activity.description}
                  </Typography>
                  <Typography variant="caption" color="primary">
                    {activity.task_title}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
} 