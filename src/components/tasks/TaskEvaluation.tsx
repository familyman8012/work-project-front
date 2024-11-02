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
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { format } from "date-fns";
import { Person } from "@mui/icons-material";

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
}

const DIFFICULTY_OPTIONS = [
  { value: "EASY", label: "쉬움" },
  { value: "MEDIUM", label: "보통" },
  { value: "HARD", label: "어려움" },
  { value: "VERY_HARD", label: "매우 어려움" },
];

export default function TaskEvaluation({ taskId }: TaskEvaluationProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [performanceScore, setPerformanceScore] = useState<number>(3);
  const [feedback, setFeedback] = useState("");

  // 평가 목록 조회
  const { data: evaluations, isLoading } = useQuery({
    queryKey: ["taskEvaluations", taskId],
    queryFn: async () => {
      const response = await client.get(
        `/api/task-evaluations/?task=${taskId}`
      );
      return response.data.results;
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

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setDifficulty("MEDIUM");
    setPerformanceScore(3);
    setFeedback("");
  };

  const handleSubmit = () => {
    createEvaluationMutation.mutate({
      task: taskId,
      difficulty,
      performance_score: performanceScore,
      feedback,
    });
  };

  const handlePerformanceScoreChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 5) {
      setPerformanceScore(value);
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
      <Box
        display="flex"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6"  sx={{ mr: "1rem" }}>작업 평가</Typography>
        <Button variant="contained" onClick={handleOpenDialog}>
          평가하기
        </Button>
      </Box>

      {/* 평가 목록 */}
      {/* <List>
        {evaluations?.map((evaluation: TaskEvaluation) => (
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
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(evaluation.created_at), "yyyy-MM-dd HH:mm")}
                </Typography>
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
        {evaluations?.length === 0 && (
          <Typography color="text.secondary" align="center">
            아직 평가가 없습니다.
          </Typography>
        )}
      </List> */}

      {/* 평가 입력 다이얼로그 */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>작업 평가</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
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
            disabled={createEvaluationMutation.isPending}
          >
            평가 제출
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
