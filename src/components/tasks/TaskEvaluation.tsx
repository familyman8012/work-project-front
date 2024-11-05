import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { format } from "date-fns";
import { Person, Edit, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
import { authStore } from "@/stores/AuthStore";

interface TaskEvaluation {
  id: number;
  evaluator: number;
  evaluator_name: string;
  difficulty: string;
  performance_score: number;
  feedback: string;
  created_at: string;
}

interface TaskEvaluationProps {
  taskId: number;
  taskDepartment: number;
  taskDepartmentParentId: number | null;
}

const DIFFICULTY_OPTIONS = [
  { value: "EASY", label: "쉬움" },
  { value: "MEDIUM", label: "보통" },
  { value: "HARD", label: "어려움" },
  { value: "VERY_HARD", label: "매우 어려움" },
];

export default function TaskEvaluation({
  taskId,
  taskDepartment,
  taskDepartmentParentId,
}: TaskEvaluationProps) {
  const user = authStore.user;
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [performanceScore, setPerformanceScore] = useState<number>(3);
  const [feedback, setFeedback] = useState("");
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<TaskEvaluation | null>(null);

  // 평가 권한 체크 함수들
  const canViewEvaluations = () => {
    if (!user) return false;

    // EMPLOYEE는 평가를 볼 수 없음
    if (user.role === "EMPLOYEE") return false;

    // ADMIN은 모든 평가를 볼 수 있음
    if (user.role === "ADMIN") return true;

    // DIRECTOR/GENERAL_MANAGER는 본부 내 평가를 볼 수 있음
    if (user.rank === "DIRECTOR" || user.rank === "GENERAL_MANAGER") {
      // 본부장인 경우 본부 직속 + 산하 팀 평가 가능
      if (user.department === taskDepartmentParentId) return true;
      // 팀장인 경우 자신의 팀 평가만 가능
      return user.department === taskDepartment;
    }

    // MANAGER는 팀 내 평가만 볼 수 있음
    if (user.role === "MANAGER") {
      return user.department === taskDepartment;
    }

    return false;
  };

  // 평가 작성 권한 체크
  const canCreateEvaluation = () => {
    if (!user) return false;

    // EMPLOYEE는 평가 불가
    if (user.role === "EMPLOYEE") return false;

    // ADMIN은 모든 작업 평가 가능
    if (user.role === "ADMIN") return true;

    // DIRECTOR/GENERAL_MANAGER는 본부 내 작업 평가 가능
    if (user.rank === "DIRECTOR" || user.rank === "GENERAL_MANAGER") {
      // 본부장인 경우 본부 직속 + 산하 팀 평가 가능
      if (user.department === taskDepartmentParentId) return true;
      // 팀장인 경우 자신의 팀 평가만 가능
      return user.department === taskDepartment;
    }

    // MANAGER는 팀 내 작업만 평가 가능
    if (user.role === "MANAGER") {
      return user.department === taskDepartment;
    }

    return false;
  };

  // 평가 관리(수정/삭제) 권한 체크
  const canManageEvaluation = (evaluatorId: number) => {
    if (!user) return false;

    // 자신이 작성한 평가는 수정/삭제 가능
    if (evaluatorId === user.id) return true;

    // ADMIN은 모든 평가 관리 가능
    if (user.role === "ADMIN") return true;

    return false;
  };

  // 평가 목록 조회
  const { data: evaluations, isLoading } = useQuery({
    queryKey: ["taskEvaluations", taskId],
    queryFn: async () => {
      const response = await client.get(
        `/api/task-evaluations/?task=${taskId}`
      );
      return response.data.results;
    },
    enabled: canViewEvaluations(),
  });

  // 평가 삭제 mutation
  const deleteEvaluationMutation = useMutation({
    mutationFn: async (evaluationId: number) => {
      await client.delete(`/api/task-evaluations/${evaluationId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskEvaluations", taskId] });
      toast.success("평가가 삭제되었습니다.");
    },
  });

  // 표시할 평가 필터링
  const getVisibleEvaluations = () => {
    if (!evaluations) return [];

    // 관리자는 모든 평가를 볼 수 있음
    if (user?.role === "ADMIN") return evaluations;

    // 본부장/이사는 모든 평가를 볼 수 있음
    if (user?.rank === "DIRECTOR" || user?.rank === "GENERAL_MANAGER") {
      return evaluations;
    }

    // 팀장은 자신의 평가만 볼 수 있음
    return evaluations.filter(
      (evaluation: TaskEvaluation) => evaluation.evaluator === user?.id
    );
  };

  const visibleEvaluations = getVisibleEvaluations();

  // 평가 수정 mutation
  const updateEvaluationMutation = useMutation({
    mutationFn: async (data: {
      id: number;
      difficulty: string;
      performance_score: number;
      feedback: string;
    }) => {
      return client.patch(`/api/task-evaluations/${data.id}/`, {
        difficulty: data.difficulty,
        performance_score: data.performance_score,
        feedback: data.feedback,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskEvaluations", taskId] });
      handleCloseDialog();
      toast.success("평가가 수정되었습니다.");
    },
  });

  // 평가 생성
  const createEvaluationMutation = useMutation({
    mutationFn: async (data: {
      task: number;
      difficulty: string;
      performance_score: number;
      feedback: string;
    }) => {
      return client.post("/api/task-evaluations/", {
        task: taskId,
        difficulty: data.difficulty,
        performance_score: data.performance_score,
        feedback: data.feedback,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskEvaluations", taskId] });
      handleCloseDialog();
    },
  });

  // 평가 섹션 자체를 표시하지 않음
  if (!canViewEvaluations()) {
    return null;
  }

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedEvaluation(null);
    setDifficulty("MEDIUM");
    setPerformanceScore(3);
    setFeedback("");
  };

  const handleEdit = (evaluation: TaskEvaluation) => {
    setSelectedEvaluation(evaluation);
    setDifficulty(evaluation.difficulty);
    setPerformanceScore(evaluation.performance_score);
    setFeedback(evaluation.feedback);
    setIsDialogOpen(true);
  };

  const handlePerformanceScoreChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 5) {
      setPerformanceScore(value);
    }
  };

  const handleSubmit = () => {
    if (selectedEvaluation) {
      // 수정
      updateEvaluationMutation.mutate({
        id: selectedEvaluation.id,
        difficulty,
        performance_score: performanceScore,
        feedback,
      });
    } else {
      // 새로 생성
      createEvaluationMutation.mutate({
        task: taskId,
        difficulty,
        performance_score: performanceScore,
        feedback,
      });
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ mr: "1rem" }}>
          작업 평가
        </Typography>
        {/* 평가 작성 권한이 있는 경우만 평가하기 버튼 표시 */}
        {canCreateEvaluation() && (
          <Button variant="contained" onClick={handleOpenDialog}>
            평가하기
          </Button>
        )}
      </Box>

      <List>
        {visibleEvaluations.map((evaluation: TaskEvaluation) => (
          <Paper key={evaluation.id} sx={{ mb: 2 }}>
            <ListItem
              sx={{ flexDirection: "column", alignItems: "flex-start" }}
            >
              <Box
                width="100%"
                display="flex"
                justifyContent="space-between"
                mb={1}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Person />
                  <Typography variant="subtitle1">
                    {evaluation.evaluator_name}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" color="text.secondary">
                    {format(
                      new Date(evaluation.created_at),
                      "yyyy-MM-dd HH:mm"
                    )}
                  </Typography>
                  {/* 평가 관리 권한이 있는 경우만 수정/삭제 버튼 표시 */}
                  {canManageEvaluation(evaluation.evaluator) && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(evaluation)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          deleteEvaluationMutation.mutate(evaluation.id)
                        }
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Box>

              <Box display="flex" gap={3} mb={1}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    난이도
                  </Typography>
                  <Typography>
                    {
                      DIFFICULTY_OPTIONS.find(
                        (opt) => opt.value === evaluation.difficulty
                      )?.label
                    }
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    성과 점수
                  </Typography>
                  <Typography>{evaluation.performance_score}점</Typography>
                </Box>
              </Box>

              <Box width="100%">
                <Typography variant="body2" color="text.secondary">
                  피드백
                </Typography>
                <Typography>{evaluation.feedback}</Typography>
              </Box>
            </ListItem>
          </Paper>
        ))}
        {visibleEvaluations.length === 0 && (
          <Typography color="text.secondary" align="center">
            아직 평가가 없습니다.
          </Typography>
        )}

        {/* 팀장에게 상급자 평가 존재 알림 */}
        {user?.role === "MANAGER" &&
          evaluations?.length > visibleEvaluations.length && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {evaluations.length - visibleEvaluations.length}개의 평가 기록이
              있습니다.
            </Alert>
          )}
      </List>

      {/* 평가 입력/수정 다이얼로그 */}
      {canCreateEvaluation() && (
        <Dialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedEvaluation ? "평가 수정" : "작업 평가"}
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}
            >
              <FormControl fullWidth>
                <InputLabel>난이도</InputLabel>
                <Select
                  value={difficulty}
                  label="난이도"
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="성과 점수"
                type="number"
                value={performanceScore}
                onChange={handlePerformanceScoreChange}
                fullWidth
                InputProps={{
                  inputProps: { min: 1, max: 5 },
                }}
                helperText="1점(매우 미흡) ~ 5점(매우 우수)"
              />

              <TextField
                label="피드백"
                multiline
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>취소</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={
                createEvaluationMutation.isPending ||
                updateEvaluationMutation.isPending
              }
            >
              {selectedEvaluation ? "수정" : "평가 제출"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
