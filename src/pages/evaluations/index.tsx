import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  Chip,
  Pagination,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { withAuth } from "@/components/auth/withAuth";
import Layout from "@/components/layout/Layout";
import { client } from "@/lib/api/client";
import { format } from "date-fns";
import Person from "@mui/icons-material/Person";
import { authStore } from "@/stores/AuthStore";

const DIFFICULTY_OPTIONS = [
  { value: "", label: "전체" },
  { value: "EASY", label: "쉬움" },
  { value: "MEDIUM", label: "보통" },
  { value: "HARD", label: "어려움" },
  { value: "VERY_HARD", label: "매우 어려움" },
];

interface Task {
  id: number;
  title: string;
  description: string;
  assignee_name: string;
  start_date: string;
  due_date: string;
  actual_hours: number;
  difficulty: string;
}

interface Evaluation {
  id: number;
  task: Task;
  evaluator_name: string;
  difficulty: string;
  performance_score: number;
  feedback: string;
  created_at: string;
}

function EvaluationsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    difficulty: "",
    search: "",
  });
  const user = authStore.user;

  // 평가 목록 조회 - 권한에 따른 필터링
  const { data: evaluations, isLoading } = useQuery({
    queryKey: ["evaluations", filters, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.difficulty) params.append("difficulty", filters.difficulty);
      if (filters.search) params.append("search", filters.search);
      params.append("page", String(page));

      // 권한에 따른 추가 필터링
      if (user?.role === "MANAGER") {
        // 팀장은 자신의 팀 평가만 조회
        params.append("department", String(user.department));
      } else if (
        user?.rank === "DIRECTOR" ||
        user?.rank === "GENERAL_MANAGER"
      ) {
        // 본부장/이사는 본부 내 평가만 조회
        if (user.department) {
          params.append("department", String(user.department));
          params.append("include_child_depts", "true"); // 하위 부서 포함
        }
      }
      // ADMIN은 추가 필터 없이 모든 평가 조회 가능
      // EMPLOYEE는 TaskEvaluationViewSet에서 이미 자신의 작업에 대한 평가만 필터링됨

      const response = await client.get(
        `/api/task-evaluations/?${params.toString()}`
      );
      return response.data;
    },
    enabled: !!user && user.role !== "EMPLOYEE", // EMPLOYEE는 평가 목록 조회 불가
  });

  // EMPLOYEE는 접근 불가
  if (user?.role === "EMPLOYEE") {
    return (
      <Layout>
        <Box p={3}>
          <Alert severity="error">평가 목록 조회 권한이 없습니다.</Alert>
        </Box>
      </Layout>
    );
  }

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "success";
    if (score >= 3.5) return "info";
    if (score >= 2.5) return "warning";
    return "error";
  };

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <Layout>
        <Box p={3}>
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        </Box>
      </Layout>
    );
  }

  // 데이터가 없는 경우 처리
  if (!evaluations?.results?.length) {
    return (
      <Layout>
        <Box p={3}>
          <Typography variant="h5" gutterBottom>
            작업 평가 목록
          </Typography>
          {/* 필터 섹션은 유지 */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="작업 검색"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>난이도</InputLabel>
                  <Select
                    value={filters.difficulty}
                    label="난이도"
                    onChange={(e) =>
                      handleFilterChange("difficulty", e.target.value)
                    }
                  >
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              표시할 평가 내역이 없습니다.
            </Typography>
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box p={3}>
        <Typography variant="h5" gutterBottom>
          작업 평가 목록
        </Typography>

        {/* 필터 섹션 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="작업 검색"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>난이도</InputLabel>
                <Select
                  value={filters.difficulty}
                  label="난이도"
                  onChange={(e) =>
                    handleFilterChange("difficulty", e.target.value)
                  }
                >
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* 평가 목록 */}
        <Grid container spacing={3}>
          {evaluations.results.map((evaluation: Evaluation) => (
            <Grid item xs={12} key={evaluation.id}>
              <Card>
                <CardContent>
                  {/* 작업 정보 섹션 */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {evaluation.task.title}
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                      {evaluation.task.description}
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          담당자
                        </Typography>
                        <Typography>{evaluation.task.assignee_name}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          시작일
                        </Typography>
                        <Typography>
                          {format(
                            new Date(evaluation.task.start_date),
                            "yyyy-MM-dd"
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          마감일
                        </Typography>
                        <Typography>
                          {format(
                            new Date(evaluation.task.due_date),
                            "yyyy-MM-dd"
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          실제 소요 시간
                        </Typography>
                        <Typography>
                          {evaluation.task.actual_hours}시간
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box display="flex" gap={1}>
                      <Chip
                        label={`난이도: ${
                          DIFFICULTY_OPTIONS.find(
                            (opt) => opt.value === evaluation.task.difficulty
                          )?.label
                        }`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* 평가 정보 섹션 */}
                  <Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Person />
                        <Typography>
                          평가자: {evaluation.evaluator_name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {format(
                          new Date(evaluation.created_at),
                          "yyyy-MM-dd HH:mm"
                        )}
                      </Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          평가 난이도
                        </Typography>
                        <Typography>
                          {
                            DIFFICULTY_OPTIONS.find(
                              (opt) => opt.value === evaluation.difficulty
                            )?.label
                          }
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          성과 점수
                        </Typography>
                        <Typography>
                          {evaluation.performance_score}점
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        피드백
                      </Typography>
                      <Typography>{evaluation.feedback}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 페이지네이션 */}
        {evaluations.count > 0 && (
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={Math.ceil(evaluations.count / 10)}
              page={page}
              onChange={(_, value) => setPage(value)}
            />
          </Box>
        )}
      </Box>
    </Layout>
  );
}

export default withAuth(EvaluationsPage);
