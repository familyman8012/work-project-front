import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from "@mui/material";
import { Notifications, Logout, Settings, Person } from "@mui/icons-material";
import { observer } from "mobx-react";
import { authStore } from "@/stores/AuthStore";
import { useRouter } from "next/router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import NotificationDropdown from "./NotificationDropdown";

const Header = observer(() => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);

  // 알림 개수 가져오기
  const { data: notificationCount } = useQuery({
    queryKey: ["notificationCount"],
    queryFn: async () => {
      const response = await client.get("/api/notifications/unread-count/");
      return response.data;
    },
    enabled: authStore.isAuthenticated,
  });

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    authStore.logout();
    router.push("/login");
    handleClose();
  };

  const handleProfilePage = () => {
    router.push("/profile");
    handleClose();
  };

  const handleSettings = () => {
    router.push("/settings");
    handleClose();
  };

  return (
    <AppBar
      position="sticky"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          작업 관리 시스템
        </Typography>

        {authStore.isAuthenticated && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <NotificationDropdown />
            {/* 사용자 프로필 */}
            <Box
              onClick={handleProfileClick}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                "&:hover": { opacity: 0.8 },
              }}
            >
              <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                {authStore.user?.first_name?.[0] ||
                  authStore.user?.username?.[0]}
              </Avatar>
              <Typography variant="subtitle1">
                {authStore.user?.first_name} {authStore.user?.last_name}
              </Typography>
            </Box>
          </Box>
        )}

        {/* 알림 메뉴 */}
        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: { width: 320, maxHeight: 400 },
          }}
        >
          <MenuItem onClick={() => router.push("/notifications")}>
            <Typography variant="subtitle2">모든 알림 보기</Typography>
          </MenuItem>
        </Menu>

        {/* 프로필 메뉴 */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleProfilePage}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            프로필
          </MenuItem>
          <MenuItem onClick={handleSettings}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            설정
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            로그아웃
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
});

export default Header;
