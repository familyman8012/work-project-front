import Layout from "@/components/layout/Layout";
import { withAuth } from "@/components/auth/withAuth";
import UserInfoCard from "@/components/dashboard/UserInfoCard";
import TodayTasksCard from "@/components/dashboard/TodayTasksCard";
import RecentNotifications from "@/components/dashboard/RecentNotifications";
import { Box, Grid } from "@mui/material";

function HomePage() {
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <UserInfoCard />
          </Grid>
          <Grid item xs={12}>
            <TodayTasksCard />
          </Grid>
          <Grid item xs={12}>
            <RecentNotifications />
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}

export default withAuth(HomePage);
