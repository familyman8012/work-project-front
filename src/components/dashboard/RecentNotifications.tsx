import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  List,
  ListItem,
  IconButton,
} from "@mui/material";
import {
  Notifications,
  Warning,
  Assignment,
  CheckCircle,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { format } from "date-fns";
import Link from "next/link";

interface Notification {
  id: number;
  message: string;
  notification_type: string;
  created_at: string;
  is_read: boolean;
  task_title: string;
  task: number;
}

export default function RecentNotifications() {
  const { data: notifications } = useQuery({
    queryKey: ["recentNotifications"],
    queryFn: async () => {
      const response = await client.get("/api/notifications/?is_read=false");
      return response.data.results.slice(0, 5); // 최근 5개만 표시
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "TASK_OVERDUE":
        return <Warning color="error" />;
      case "TASK_ASSIGNED":
        return <Assignment color="primary" />;
      case "TASK_COMPLETED":
        return <CheckCircle color="success" />;
      default:
        return <Notifications color="action" />;
    }
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Notifications sx={{ fontSize: 40, mr: 2, color: "primary.main" }} />
          <Typography variant="h5" component="div">
            최근 알림
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <List>
          {notifications?.length === 0 ? (
            <Typography color="text.secondary" align="center">
              새로운 알림이 없습니다.
            </Typography>
          ) : (
            notifications?.map((notification: Notification) => (
              <Link
                href={`/tasks/${notification.task}`}
                key={notification.id}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <ListItem
                  sx={{
                    display: "flex",
                    gap: 2,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  {getNotificationIcon(notification.notification_type)}
                  <Box flex={1}>
                    <Typography variant="body2">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(notification.created_at), "MM/dd HH:mm")}
                    </Typography>
                  </Box>
                </ListItem>
              </Link>
            ))
          )}
        </List>
      </CardContent>
    </Card>
  );
}
