import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import { withAuth } from "@/components/auth/withAuth";
import Layout from "@/components/layout/Layout";
import { client } from "@/lib/api/client";

interface LLMAnalysisResult {
  question: string;
  sql_query: string;
  result: any;
  formatted_result: string;
}

const EXAMPLE_QUESTIONS = [
  "지금 평가 점수가 가장 높은 직원이 누구지?",
  "푸드테크본부 직원은 몇 명이야?",
  "백엔드팀 직원 수는?",
  "완료된 작업이 가장 많은 직원은?",
  "이번 달에 지연된 작업은 몇 개야?",
  "평균 작업 완료 시간이 가장 짧은 팀은?",
];

function LLMAnalysisPage() {
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await client.post("/api/experiments/llm/analyze/", {
        question,
      });
      return response.data as LLMAnalysisResult;
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || "분석 중 오류가 발생했습니다.");
    },
  });

  const formatRawResult = (result: any) => {
    if (!result) return "결과 없음";
    try {
      if (Array.isArray(result)) {
        if (result.length === 0) return "결과 없음";
        if (
          result.length === 1 &&
          Array.isArray(result[0]) &&
          result[0].length === 1
        ) {
          return result[0][0].toString();
        }
        return result
          .map((item) => {
            if (Array.isArray(item)) {
              return item.join(", ");
            }
            return item.toString();
          })
          .join("\n");
      }
      return JSON.stringify(result, null, 2);
    } catch (e) {
      console.error("결과 포맷팅 오류:", e);
      return "결과 포맷팅 오류";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError("질문을 입력해주세요.");
      return;
    }
    setError(null);
    analyzeMutation.mutate(question);
  };

  const handleExampleClick = (example: string) => {
    setQuestion(example);
    analyzeMutation.mutate(example);
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          LLM 데이터 분석
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="분석하고 싶은 내용을 질문해주세요"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="예: 푸드테크본부 직원은 몇 명이야?"
            />
            <Button
              type="submit"
              variant="contained"
              disabled={analyzeMutation.isPending}
            >
              {analyzeMutation.isPending ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  분석 중...
                </>
              ) : (
                "분석 요청"
              )}
            </Button>
          </form>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            예시 질문
          </Typography>
          <List dense>
            {EXAMPLE_QUESTIONS.map((example, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton onClick={() => handleExampleClick(example)}>
                  <ListItemText primary={example} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {analyzeMutation.data && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              분석 결과
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                SQL 쿼리
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  p: 2,
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {analyzeMutation.data.sql_query}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                원본 결과
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  p: 2,
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {formatRawResult(analyzeMutation.data.result)}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                분석 결과
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  p: 2,
                  bgcolor: "primary.50",
                  borderRadius: 1,
                }}
              >
                {analyzeMutation.data.formatted_result}
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </Layout>
  );
}

export default withAuth(LLMAnalysisPage);
