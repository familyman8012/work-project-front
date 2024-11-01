import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ko } from "date-fns/locale";
import { withAuth } from "@/components/auth/withAuth";
import Layout from "@/components/layout/Layout";
import { client } from "@/lib/api/client";
import { TaskPriority, TaskStatus } from "@/types/type";

interface CreateTaskForm {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: number;
  department: number;
  start_date: Date | null;
  due_date: Date | null;
  estimated_hours: number;
}

const initialForm: CreateTaskForm = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  assignee: 0,
  department: 0,
  start_date: null,
  due_date: null,
  estimated_hours: 0,
};

function CreateTaskPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateTaskForm>(initialForm);
  const [error, setError] = useState<string | null>(null);

  // 부서 목록 조회
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await client.get("/api/departments/");
      return response.data;
    },
  });

  // 사용자 목록 조회
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await client.get("/api/users/");
      return response.data.results;
    },
  });

  // 작업 생성 mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: CreateTaskForm) => {
      return await client.post("/api/tasks/", {
        ...data,
        start_date: data.start_date?.toISOString(),
        due_date: data.due_date?.toISOString(),
      });
    },
    onSuccess: (response) => {
      router.push(`/tasks/${response.data.id}`);
    },
    onError: (error: any) => {
      setError(
        error.response?.data?.detail || "작업 생성 중 오류가 발생했습니다."
      );
    },
  });

  const handleChange = (name: keyof CreateTaskForm, value: any) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (
      !form.title ||
      !form.assignee ||
      !form.department ||
      !form.start_date ||
      !form.due_date
    ) {
      setError("필수 항목을 모두 입력해주세요.");
      return;
    }

    createTaskMutation.mutate(form);
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            새 작업 생성
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="제목"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="설명"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>부서</InputLabel>
                <Select
                  value={form.department || ""}
                  label="부서"
                  onChange={(e) => handleChange("department", e.target.value)}
                >
                  {departments.map((dept: any) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>담당자</InputLabel>
                <Select
                  value={form.assignee || ""}
                  label="담당자"
                  onChange={(e) => handleChange("assignee", e.target.value)}
                >
                  {users.map((user: any) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.department_name}
                      )
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>우선순위</InputLabel>
                <Select
                  value={form.priority}
                  label="우선순위"
                  onChange={(e) => handleChange("priority", e.target.value)}
                >
                  <MenuItem value="LOW">낮음</MenuItem>
                  <MenuItem value="MEDIUM">중간</MenuItem>
                  <MenuItem value="HIGH">높음</MenuItem>
                  <MenuItem value="URGENT">긴급</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="예상 소요 시간"
                value={form.estimated_hours}
                onChange={(e) =>
                  handleChange("estimated_hours", Number(e.target.value))
                }
                InputProps={{ inputProps: { min: 0, step: 0.5 } }}
              />
            </Grid>

            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ko}
            >
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="시작일"
                  value={form.start_date}
                  onChange={(date) => handleChange("start_date", date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="마감일"
                  value={form.due_date}
                  onChange={(date) => handleChange("due_date", date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Grid>
            </LocalizationProvider>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                  disabled={createTaskMutation.isPending}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createTaskMutation.isPending}
                >
                  {createTaskMutation.isPending ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      생성 중...
                    </>
                  ) : (
                    "작업 생성"
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Layout>
  );
}

export default withAuth(CreateTaskPage);
