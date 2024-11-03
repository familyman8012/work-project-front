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
  alpha,
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
    const menuSection = [
      { 
        title: "메뉴",
        items: [
          { text: "대시보드", icon: <Dashboard />, path: "/" },
          { text: "내 작업", icon: <AssignmentTurnedIn />, path: "/my-tasks" },
          { text: "일정", icon: <Assignment />, path: "/tasks" },
          { text: "알림", icon: <Notifications />, path: "/notifications" },
        ]
      }
    ];

    const managementSection = {
      title: "관리",
      items: [
        { text: "직원 관리", icon: <People />, path: "/users" },      
        { text: "작업 평가", icon: <GradeRounded />, path: "/evaluations" },
        { text: "통계", icon: <Assessment />, path: "/reports" },
      ]
    };

    const adminSection = {
      title: "시스템 관리",
      items: [
        { text: "부서/팀 관리", icon: <Business />, path: "/departments/manage" },     
        { text: "직원 등록", icon: <People />, path: "/users/manage" },
      ]
    };

    const sections = [...menuSection];

    if (user?.role === "ADMIN" || user?.rank === "DIRECTOR") {
      sections.push(managementSection, adminSection);
    } else if (user?.rank === "GENERAL_MANAGER" || 
        (user?.role === "MANAGER" && user?.rank !== "STAFF")) {
      sections.push(managementSection);
    }

    return sections;
  };

  const sections = getFilteredMenuItems();

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
        
        {sections.map((section, index) => (
          <Box key={section.title} sx={{ mt: index !== 0 ? 2 : 0 }}>
            <Typography
              variant="caption"
              sx={{
                px: 3,
                py: 1.5,
                display: 'block',
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {section.title}
            </Typography>
            <List sx={{ pb: 0 }}>
              {section.items.map((item) => {
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
                          mx: 1,
                          borderRadius: 1,
                          "&.Mui-selected": {
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.9),
                            color: "white",
                            "&:hover": {
                              backgroundColor: "primary.main",
                            },
                            "& .MuiListItemIcon-root": {
                              color: "white",
                            },
                          },
                          "&:hover": {
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                          }
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: isActive ? "white" : "inherit",
                            minWidth: 40,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{
                            fontSize: "0.9rem",
                            fontWeight: isActive ? 600 : 400,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Link>
                );
              })}
            </List>
            {index !== sections.length - 1 && (
              <Divider sx={{ mt: 1, mx: 2, opacity: 0.7 }} />
            )}
          </Box>
        ))}
      </Box>
    </Drawer>
  );
});

export default Sidebar;
