import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { TaskPriority, TaskStatus, TaskDifficulty } from "@/types/type";
import { authStore } from "@/stores/AuthStore";
import { toast } from "react-toastify";
import { getRankText } from "@/lib/getRankText";

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
  difficulty: TaskDifficulty;
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
  difficulty: "MEDIUM",
};

// 부서 계층 구조 생성 함수 추가
const organizeHierarchy = (depts: any[]) => {
  const headquarters = depts.filter(dept => dept.parent === null);
  
  const getTeams = (hqId: number) => {
    return depts.filter(dept => dept.parent === hqId);
  };

  return headquarters.map(hq => ({
    ...hq,
    teams: getTeams(hq.id)
  }));
};

// 부서 옵션 렌더링 함수 추가
const renderDepartmentOptions = (departments: any[]) => {
  const hierarchicalDepts = organizeHierarchy(departments);
  const options: JSX.Element[] = [];

  hierarchicalDepts.forEach(hq => {
    // 본부 레벨
    options.push(
      <MenuItem 
        key={hq.id} 
        value={hq.id}
        sx={{
          fontWeight: 'bold',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        📂 {hq.name}
      </MenuItem>
    );

    // 해당 본부의 하위 팀들
    hq.teams?.forEach(team => {
      options.push(
        <MenuItem 
          key={team.id} 
          value={team.id}
          sx={{ pl: 4 }}
        >
          └ {team.name}
        </MenuItem>
      );
    });
  });

  return options;
};

function CreateTaskPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateTaskForm>(initialForm);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // 부서 목록 조회
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await client.get("/api/departments/");
      return response.data;
    },
  });

  // 사용자 목록 조회
  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ["users", form.department],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (form.department) {
          params.append("department", String(form.department));
          params.append("include_child_depts", "false");
          console.log("Fetching users with params:", params.toString());
        }
        const response = await client.get(`/api/users/?${params.toString()}`);
        console.log("Users API Response:", response.data);
        return response.data;
      } catch (error) {
        console.error("Users API Error:", error);
        return [];
      }
    },
    enabled: !!form.department,
  });

  // 작업 생성 mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: CreateTaskForm) => {
      try {
        const response = await client.post("/api/tasks/", {
          ...data,
          start_date: data.start_date?.toISOString(),
          due_date: data.due_date?.toISOString(),
          reporter: authStore.user?.id,
        });
        return response.data;
      } catch (error: any) {
        console.error("Create Task Error:", error.response?.data);
        throw error;
      }
    },
    onSuccess: (response) => {
      toast.success("작업이 성공적으로 생성되었습니다!");

      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      router.push(`/tasks`);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "작업 생성 중 오류가 발생했습니다.";
      toast.error(errorMessage);
      setError(errorMessage);
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

  const handleDepartmentChange = (departmentId: number) => {
    setForm((prev) => ({
      ...prev,
      department: departmentId,
      assignee: 0,
    }));
  };

  console.log("users", users);

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
                  onChange={(e) => handleDepartmentChange(e.target.value as number)}
                  MenuProps={{
                    PaperProps: {
                      sx: { maxHeight: 400 }
                    }
                  }}
                >
                  {renderDepartmentOptions(departments)}
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
                  disabled={!form.department}
                >
                  {!form.department ? (
                    <MenuItem disabled>부서를 먼저 선택해주세요</MenuItem>
                  ) : isUsersLoading ? (
                    <MenuItem disabled>로딩중...</MenuItem>
                  ) : users?.results.length > 0 ? (
                    users.results.map((user: any) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.last_name}{user.first_name} ({getRankText(user.rank)})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>해당 부서에 사용자가 없습니다</MenuItem>
                  )}
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
                type="text"
                label="예상 소요 시간"
                value={form.estimated_hours}
                onChange={(e) =>
                  handleChange("estimated_hours", Number(e.target.value))
                }
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

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>난이도</InputLabel>
                <Select
                  value={form.difficulty}
                  label="난이도"
                  onChange={(e) => handleChange("difficulty", e.target.value)}
                >
                  <MenuItem value="EASY">쉬움</MenuItem>
                  <MenuItem value="MEDIUM">보통</MenuItem>
                  <MenuItem value="HARD">어려움</MenuItem>
                  <MenuItem value="VERY_HARD">매우 어려움</MenuItem>
                </Select>
              </FormControl>
            </Grid>

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
