import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Typography,
  Divider,
  ListItemButton,
} from "@mui/material";
import {
  Dashboard,
  Assignment,
  People,
  Notifications,
  AssignmentTurnedIn,
  Schedule,
  Assessment,
  GradeRounded,
} from "@mui/icons-material";
import { observer } from "mobx-react";
import { authStore } from "@/stores/AuthStore";
import Link from "next/link";
import { useRouter } from "next/router";

const drawerWidth = 280;

const menuItems = [
  { text: "대시보드", icon: <Dashboard />, path: "/" },
  { text: "내 작업", icon: <AssignmentTurnedIn />, path: "/my-tasks" },
  { text: "일정", icon: <Schedule />, path: "/schedule" },
  { text: "알림", icon: <Notifications />, path: "/notifications" },
 

];

const menuItems1 = [

  { text: "작업 관리", icon: <Assignment />, path: "/tasks" },
  { text: "직원 관리", icon: <People />, path: "/users" },
  { text: "작업 평가", icon: <GradeRounded />, path: "/evaluations" },
  { text: "통계", icon: <Assessment />, path: "/statistics" },

];

const Sidebar = observer(() => {
  const user = authStore.user;
  const router = useRouter();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid rgba(0, 0, 0, 0.12)",
          height: "calc(100vh - 64px)",
          top: "64px",
        },
      }}
    >
      <Box>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Avatar sx={{ width: 64, height: 64, mr: 2 }}>
              {user?.first_name?.[0] || user?.username?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.role === "ADMIN"
                  ? "관리자"
                  : user?.role === "MANAGER"
                  ? "매니저"
                  : "직원"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.department_name}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => {
            const isActive = router.pathname === item.path;

            return (
              <Link
                href={item.path}
                key={item.text}
                passHref
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <ListItem disablePadding>
                  <ListItemButton
                    selected={isActive}
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "primary.main",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "primary.dark",
                        },
                        "& .MuiListItemIcon-root": {
                          color: "white",
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? "white" : "inherit",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: "0.9rem",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Link>
            );
          })}
          <Divider />
          {menuItems1.map((item) => {
            const isActive = router.pathname === item.path;

            return (
              <Link
                href={item.path}
                key={item.text}
                passHref
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <ListItem disablePadding>
                  <ListItemButton
                    selected={isActive}
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "primary.main",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "primary.dark",
                        },
                        "& .MuiListItemIcon-root": {
                          color: "white",
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? "white" : "inherit",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: "0.9rem",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Link>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
});

export default Sidebar;
