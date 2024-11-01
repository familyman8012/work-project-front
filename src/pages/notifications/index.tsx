import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  CheckCircle,
  RadioButtonUnchecked,
  AccessTime,
  Assignment,
} from "@mui/icons-material";
import { withAuth } from "@/components/auth/withAuth";
import Layout from "@/components/layout/Layout";
import { client } from "@/lib/api/client";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Notification, PaginatedResponse } from "@/types/notification";

function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const queryClient = useQueryClient();

  // 알림 목록 조회
  const { data: notificationsData, isLoading } = useQuery<
    PaginatedResponse<Notification>
  >({
    queryKey: ["notifications", filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("is_read", filter === "read" ? "true" : "false");
      }
      const response = await client.get(`/api/notifications/?${params}`);
      return response.data;
    },
  });

  const notifications = notificationsData?.results || [];

  // 알림 읽음 처리
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await client.patch(`/api/notifications/${notificationId}/`, {
        is_read: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
    },
  });

  // 전체 읽음 처리
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await client.post("/api/notifications/mark_all_read/");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
      toast.success("모든 알림을 읽음 처리했습니다.");
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "TASK_ASSIGNED":
        return <Assignment color="primary" />;
      case "TASK_STATUS_CHANGED":
        return <CheckCircle color="success" />;
      case "TASK_DUE_SOON":
        return <AccessTime color="warning" />;
      default:
        return <RadioButtonUnchecked />;
    }
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

  if (isLoading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5">알림</Typography>
          <Box display="flex" gap={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>필터</InputLabel>
              <Select
                value={filter}
                label="필터"
                onChange={(e) =>
                  setFilter(e.target.value as "all" | "unread" | "read")
                }
              >
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="unread">읽지 않음</MenuItem>
                <MenuItem value="read">읽음</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              전체 읽음 처리
            </Button>
          </Box>
        </Box>

        <Paper>
          <List>
            {notifications.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography align="center" color="text.secondary">
                      알림이 없습니다.
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
                    secondaryAction={
                      !notification.is_read && (
                        <Button
                          size="small"
                          onClick={() =>
                            markAsReadMutation.mutate(notification.id)
                          }
                        >
                          읽음 처리
                        </Button>
                      )
                    }
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      {getNotificationIcon(notification.notification_type)}
                      <Box flex={1}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          mb={0.5}
                        >
                          <Chip
                            label={getNotificationTypeText(
                              notification.notification_type
                            )}
                            size="small"
                            color={notification.is_read ? "default" : "primary"}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {format(
                              new Date(notification.created_at),
                              "yyyy-MM-dd HH:mm"
                            )}
                          </Typography>
                        </Box>
                        <Typography>{notification.message}</Typography>
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ mt: 0.5 }}
                        >
                          {notification.task_title}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                  <Divider />
                </Box>
              ))
            )}
          </List>
        </Paper>
      </Box>
    </Layout>
  );
}

export default withAuth(NotificationsPage);
