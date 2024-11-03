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
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            background: "linear-gradient(45deg, #2563eb 30%, #3b82f6 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Govis Task Management
        </Typography>

        {authStore.isAuthenticated && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              size="large"
              onClick={handleNotificationClick}
              sx={{ 
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.1)" } 
              }}
            >
              <Badge badgeContent={notificationCount?.count || 0} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            
            <IconButton
              onClick={handleProfileClick}
              sx={{
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.1)" }
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: "primary.main",
                  width: 35,
                  height: 35,
                }}
              >
                {authStore.user?.first_name?.[0]}
              </Avatar>
            </IconButton>
          </Box>
        )}

        {/* 알림 메뉴 */}
        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationClose}
          PaperProps={{
            elevation: 3,
            sx: { 
              width: 320, 
              maxHeight: 400,
              mt: 1.5,
              borderRadius: 2,
              overflow: 'hidden'
            },
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
          PaperProps={{
            elevation: 3,
            sx: { 
              minWidth: 200,
              mt: 1.5,
              borderRadius: 2
            },
          }}
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
