import { useState } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { Notifications } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { Notification, PaginatedResponse } from "@/types/notification";

export default function NotificationDropdown() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // 읽지 않은 알림 개수 조회
  const { data: notificationCount } = useQuery({
    queryKey: ["notificationCount"],
    queryFn: async () => {
      const response = await client.get("/api/notifications/unread-count/");
      return response.data;
    },
  });

  // 최근 알림 목록 조회 (최근 5개)
  const { data: notificationsData } = useQuery<PaginatedResponse<Notification>>(
    {
      queryKey: ["notifications", "recent"],
      queryFn: async () => {
        const response = await client.get("/api/notifications/?page_size=5");
        return response.data;
      },
    }
  );

  const notifications = notificationsData?.results || [];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewAll = () => {
    router.push("/notifications");
    handleClose();
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case "TASK_ASSIGNED":
        return "작업 배정";
      case "TASK_STATUS_CHANGED":
        return "상태 변경";
      case "TASK_DUE_SOON":
        return "마감 임박";
      default:
        return type;
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={notificationCount?.count || 0} color="error">
          <Notifications />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 360, maxHeight: 500 },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" component="div">
            알림
          </Typography>
        </Box>
        <List sx={{ py: 0 }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography align="center" color="text.secondary">
                    새로운 알림이 없습니다.
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <Box key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.is_read
                      ? "transparent"
                      : "action.hover",
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ mb: 0.5 }}>
                        <Typography
                          component="span"
                          variant="body2"
                          color="primary"
                          sx={{ mr: 1 }}
                        >
                          {getNotificationTypeText(
                            notification.notification_type
                          )}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {format(
                            new Date(notification.created_at),
                            "yyyy-MM-dd HH:mm"
                          )}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="primary">
                          {notification.task_title}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </Box>
            ))
          )}
        </List>
        <Box sx={{ p: 1, borderTop: 1, borderColor: "divider" }}>
          <Button fullWidth onClick={handleViewAll}>
            모든 알림 보기
          </Button>
        </Box>
      </Menu>
    </>
  );
}
