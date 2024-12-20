import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  Divider,
} from "@mui/material";
import {
  Person,
  Email,
  Badge,
  Business,
  Assignment,
  Schedule,
  Warning,
  CheckCircle,
} from "@mui/icons-material";
import { withAuth } from "@/components/auth/withAuth";
import Layout from "@/components/layout/Layout";
import { client } from "@/lib/api/client";
import { format } from "date-fns";
import TaskCard from "@/components/tasks/TaskCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const RANK_LABELS: { [key: string]: string } = {
  STAFF: "사원",
  SENIOR: "주임",
  ASSISTANT_MANAGER: "대리",
  MANAGER: "팀장",
  DEPUTY_GENERAL_MANAGER: "차장",
  GENERAL_MANAGER: "본부장",
  DIRECTOR: "이사",
};

function UserDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  // 사용��� 기본 정보 조회
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await client.get(`/api/users/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });

  // 현재 진행중인 작업 목록
  const { data: currentTasks, isLoading: isTasksLoading } = useQuery({
    queryKey: ["userCurrentTasks", id],
    queryFn: async () => {
      const response = await client.get(`/api/tasks/`, {
        params: {
          assignee: id,
          status: "IN_PROGRESS",
        },
      });
      return response.data.results;
    },
    enabled: !!id,
  });

  // 지연된 작업 목록 추가
  const { data: delayedTasks } = useQuery({
    queryKey: ["userDelayedTasks", id],
    queryFn: async () => {
      const response = await client.get(`/api/tasks/`, {
        params: {
          assignee: id,
          is_delayed: true,
          status_not: "DONE", // 완료된 작업은 제외
        },
      });
      return response.data.results;
    },
    enabled: !!id,
  });

  // 작업 통계 정보
  const { data: statistics, isLoading: isStatsLoading } = useQuery({
    queryKey: ["userStatistics", id],
    queryFn: async () => {
      const response = await client.get(`/api/users/${id}/tasks_statistics/`);
      return response.data;
    },
    enabled: !!id,
  });

  // 작업 통계 상세 정보 조회
  const { data: statsDetail } = useQuery({
    queryKey: ["userStatsDetail", id],
    queryFn: async () => {
      const response = await client.get(
        `/api/users/${id}/tasks_statistics_detail/`
      );
      return response.data;
    },
    enabled: !!id,
  });

  // 완료된 작업 목록 조회 쿼리 추가
  const { data: completedTasks } = useQuery({
    queryKey: ["userCompletedTasks", id],
    queryFn: async () => {
      const response = await client.get(`/api/tasks/`, {
        params: {
          assignee: id,
          status: "DONE",
        },
      });
      return response.data.results;
    },
    enabled: !!id,
  });

  // 색상 설정
  const COLORS = {
    priority: ["#ff6b6b", "#ffd93d", "#6c5ce7", "#a8e6cf"],
    difficulty: ["#ff0000", "#ff6b6b", "#ffd93d", "#a8e6cf"],
  };

  if (isUserLoading || isStatsLoading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <Box p={3}>
          <Alert severity="error">사용자를 찾을 수 없습니다.</Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box p={3}>
        {/* 기본 정보 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2}>
                <Person sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h5">
                    {user.first_name} {user.last_name}
                  </Typography>
                  <Typography color="text.secondary">
                    {RANK_LABELS[user.rank]} · {user.department_name}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" gap={1}>
                <Badge />
                <Typography>{user.employee_id}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" gap={1}>
                <Email />
                <Typography>{user.email}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" gap={1}>
                <Business />
                <Typography>{user.department_name}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* 작업 통계 */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                작업 통계
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        총 작업
                      </Typography>
                      <Typography variant="h4">
                        {statistics?.total_tasks}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        완료
                      </Typography>
                      <Typography variant="h4">
                        {statistics?.completed_tasks}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        진행중
                      </Typography>
                      <Typography variant="h4">
                        {statistics?.in_progress_tasks}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        지연
                      </Typography>
                      <Typography variant="h4" color="error">
                        {statistics?.delayed_tasks}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom>완료율</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={statistics?.completion_rate || 0}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                      <Typography variant="body2">
                        {Math.round(statistics?.completion_rate || 0)}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                우선순위별 작업
              </Typography>
              {statistics?.tasks_by_priority && (
                <Box sx={{ mt: 2 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>높음</Typography>
                    <Typography>{statistics.tasks_by_priority.HIGH}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>중간</Typography>
                    <Typography>
                      {statistics.tasks_by_priority.MEDIUM}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>낮음</Typography>
                    <Typography>{statistics.tasks_by_priority.LOW}</Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography color="text.secondary">평균 점수</Typography>
                    <Typography
                      color={
                        statsDetail?.avg_score >= 4
                          ? "success.main"
                          : "text.primary"
                      }
                      fontWeight="bold"
                    >
                      {statsDetail?.avg_score?.toFixed(1) || "-"} / 5.0
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography color="text.secondary">
                      평균 소요시간
                    </Typography>
                    <Typography>
                      {statsDetail?.avg_completion_time?.toFixed(1) || "-"}시간
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* 작업 통계 상세 정보 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            작업 통계 상세
          </Typography>
          <Grid container spacing={3}>
            {/* 우선순위 분포 */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                우선순위 분포
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={Object.entries(
                        statsDetail?.priority_distribution || {}
                      )
                        .filter(([_, value]) => Number(value) > 0)
                        .map(([key, value]) => ({
                          name: key,
                          value,
                        }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(statsDetail?.priority_distribution || {})
                        .filter(([_, value]) => Number(value) > 0)
                        .map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              COLORS.priority[index % COLORS.priority.length]
                            }
                          />
                        ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>

            {/* 난이도 분포 */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                난이도 분포
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={Object.entries(
                        statsDetail?.difficulty_distribution || {}
                      )
                        .filter(([_, value]) => Number(value) > 0)
                        .map(([key, value]) => ({
                          name: key,
                          value,
                        }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(
                        statsDetail?.difficulty_distribution || {}
                      )
                        .filter(([_, value]) => Number(value) > 0)
                        .map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              COLORS.difficulty[
                                index % COLORS.difficulty.length
                              ]
                            }
                          />
                        ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {/* 평균 작업 완료 시간 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  평균 작업 완료 시간
                </Typography>
                <Typography variant="h4">
                  {statsDetail?.avg_completion_time.toFixed(1)}시간
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 지연율 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  작업 지연율
                </Typography>
                <Typography
                  variant="h4"
                  color={statsDetail?.delay_rate > 30 ? "error" : "inherit"}
                >
                  {statsDetail?.delay_rate.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 현재 진행중인 작업 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            진행중인 작업
          </Typography>
          {currentTasks?.length > 0 ? (
            currentTasks.map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                showDates // 날짜 표시 prop 추가
              />
            ))
          ) : (
            <Typography color="text.secondary">
              진행중인 작업이 없습니다.
            </Typography>
          )}
        </Paper>

        {/* 지연된 작업 섹션 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Warning color="error" />
            <Typography variant="h6">지연된 작업</Typography>
          </Box>
          {delayedTasks?.length > 0 ? (
            delayedTasks.map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                showDates // 날짜 표시 prop 추가
              />
            ))
          ) : (
            <Typography color="text.secondary">
              지연된 작업이 없습니다.
            </Typography>
          )}
        </Paper>

        {/* 완료된 작업 섹션 추가 */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <CheckCircle color="success" />
            <Typography variant="h6">완료된 작업</Typography>
          </Box>
          {completedTasks?.length > 0 ? (
            completedTasks.map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                showDates // 날짜 표시 prop 추가
                // 작업 점수 표시 prop 추가      showScore
              />
            ))
          ) : (
            <Typography color="text.secondary">
              완료된 작업이 없습니다.
            </Typography>
          )}
        </Paper>
      </Box>
    </Layout>
  );
}

export default withAuth(UserDetailPage);
