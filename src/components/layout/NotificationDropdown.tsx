import { useState } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import { Notifications } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { useRouter } from "next/router";
import { format } from "date-fns";

interface Notification {
  id: number;
  notification_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

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
  const { data: recentNotifications = [] } = useQuery<Notification[]>({
    queryKey: ["recentNotifications"],
    queryFn: async () => {
      const response = await client.get("/api/notifications/?page_size=5");
      return response.data.results;
    },
    enabled: Boolean(anchorEl), // 드롭다운이 열릴 때만 조회
  });

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
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">알림</Typography>
          <Button size="small" onClick={handleViewAll}>
            전체 보기
          </Button>
        </Box>
        <Divider />
        <List sx={{ py: 0 }}>
          {recentNotifications.length === 0 ? (
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
            recentNotifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  bgcolor: notification.is_read
                    ? "transparent"
                    : "action.hover",
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Chip
                        label={notification.notification_type}
                        size="small"
                        color={notification.is_read ? "default" : "primary"}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {format(
                          new Date(notification.created_at),
                          "MM-dd HH:mm"
                        )}
                      </Typography>
                    </Box>
                  }
                  secondary={notification.message}
                />
              </ListItem>
            ))
          )}
        </List>
      </Menu>
    </>
  );
}
