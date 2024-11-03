import { Box, Card, CardContent, Typography, Divider } from "@mui/material";
import { observer } from "mobx-react";
import { authStore } from "@/stores/AuthStore";
import { Person } from "@mui/icons-material";
import { getRankText } from "@/lib/getRankText";

const UserInfoCard = observer(() => {
  const user = authStore.user;

  const getRoleText = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "최고 관리자";
      case "MANAGER":
        return "관리자";
      case "EMPLOYEE":
        return "일반 직원";
      default:
        return role;
    }
  };

  if (!user) return null;

  const infoItems = [
    { label: "이름", value: `${user.last_name}${user.first_name}` },
    { label: "사원 번호", value: user.employee_id },
    { label: "소속 부서", value: user.department_name },
    { label: "직급", value: getRankText(user.rank) },
    { label: "역할", value: getRoleText(user.role) },
    { label: "이메일", value: user.email },
  ];

  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Person sx={{ fontSize: 40, mr: 2, color: "primary.main" }} />
          <Typography variant="h5" component="div">
            내 정보
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: "grid", gap: 2 }}>
          {infoItems.map((item, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
              <Typography color="text.secondary" sx={{ minWidth: 100 }}>
                {item.label} :
              </Typography>
              <Typography variant="body1" sx={{ ml: 2 }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
});

export default UserInfoCard;
