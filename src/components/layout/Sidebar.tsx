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
  Business,
} from "@mui/icons-material";
import { observer } from "mobx-react";
import { authStore } from "@/stores/AuthStore";
import Link from "next/link";
import { useRouter } from "next/router";
import { getRankText } from "@/lib/getRankText";

const drawerWidth = 280;

const Sidebar = observer(() => {
  const user = authStore.user;
  const router = useRouter();

  // 권한에 따른 메뉴 필터링
  const getFilteredMenuItems = () => {
    const baseMenuItems = [
      { text: "대시보드", icon: <Dashboard />, path: "/" },
      { text: "내 작업", icon: <AssignmentTurnedIn />, path: "/my-tasks" },
      { text: "일정", icon: <Assignment />, path: "/tasks" },
      { text: "알림", icon: <Notifications />, path: "/notifications" },
    ];

    // 관리자 메뉴 아이템
    const adminMenuItems = [
      { text: "직원 관리", icon: <People />, path: "/users" },      
      { text: "작업 평가", icon: <GradeRounded />, path: "/evaluations" },
      { text: "통계", icon: <Assessment />, path: "/reports" },
    ];

    const reportMenuItems = [
      { text: "부서/팀 관리", icon: <Business />, path: "/departments/manage" },     
      { text: "직원 등록", icon: <People />, path: "/users/manage" },
    ];

    // ADMIN, DIRECTOR만 부서 관리 메뉴 표시
    if (user?.role === "ADMIN" || user?.rank === "DIRECTOR") {
      return [...baseMenuItems, ...adminMenuItems, ...reportMenuItems];
    }

    // GENERAL_MANAGER, MANAGER는 부서 관리 메뉴 제외
    if (user?.rank === "GENERAL_MANAGER" || 
        (user?.role === "MANAGER" && user?.rank !== "STAFF")) {
      return [...baseMenuItems, ...adminMenuItems.filter(item => item.text !== "부서/팀 관리")];
    }

    return baseMenuItems;
  };

  

  const menuItems = getFilteredMenuItems();

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
              {user?.last_name}{user?.first_name} 
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getRankText(String(user?.rank))}
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
        </List>
      </Box>
    </Drawer>
  );
});

export default Sidebar;
