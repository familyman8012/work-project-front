import { useState, useEffect } from "react";
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
import { Task, TaskPriority, TaskStatus, TaskDifficulty } from "@/types/type";
import { authStore } from "@/stores/AuthStore";
import { toast } from "react-toastify";

interface EditTaskForm {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: number;
  department: number;
  start_date: Date | null;
  due_date: Date | null;
  estimated_hours: number;
  actual_hours?: number;
  difficulty: TaskDifficulty;
}

function EditTaskPage() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState<EditTaskForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // 작업 상세 정보 조회
  const { data: task, isLoading: isTaskLoading } = useQuery<Task>({
    queryKey: ["task", id],
    queryFn: async () => {
      const response = await client.get(`/api/tasks/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });

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
    queryKey: ["users", form?.department],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (form?.department) {
          params.append("department", String(form.department));
          params.append("include_child_depts", "false"); // 명시적으로 하위부서 제외
          console.log("Fetching users with params:", params.toString()); // 디버깅용
        }
        const response = await client.get(`/api/users/?${params.toString()}`);
        console.log("Users API Response:", response.data); // 디버깅용
        return response.data;
      } catch (error) {
        console.error("Users API Error:", error);
        return [];
      }
    },
    enabled: !!form?.department,
  });

  // 작업 수정 mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (data: EditTaskForm) => {
      try {
        const response = await client.patch(`/api/tasks/${id}/`, {
          ...data,
          start_date: data.start_date?.toISOString(),
          due_date: data.due_date?.toISOString(),
        });
        return response.data;
      } catch (error: any) {
        console.error("Update Task Error:", error.response?.data);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("작업이 성공적으로 수정되었습니다!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      router.push(`/tasks/${id}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "작업 수정 중 오류가 발생했습니다.";
      toast.error(errorMessage);
      setError(errorMessage);
    },
  });

  // 초기 데이터 설정
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        department: task.department,
        start_date: new Date(task.start_date),
        due_date: new Date(task.due_date),
        estimated_hours: task.estimated_hours,
        actual_hours: task.actual_hours,
        difficulty: task.difficulty,
      });
    }
  }, [task]);

  const handleChange = (name: keyof EditTaskForm, value: any) => {
    if (!form) return;
    
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form) return;

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

    updateTaskMutation.mutate(form);
  };

  const handleDepartmentChange = (departmentId: number) => {
    if (!form) return;
    
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        department: departmentId,
        assignee: 0,
      };
    });
  };

  if (isTaskLoading || !form) {
    return (
      <Layout>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

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
    hq.teams?.forEach((team: any) => {
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

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            작업 수정
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
                  onChange={(e) =>
                    handleDepartmentChange(e.target.value as number)
                  }
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
                  ) : users?.results?.length > 0 ? (
                    users.results.map((user: any) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.last_name}{user.first_name} ({user.rank})
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
                <InputLabel>상태</InputLabel>
                <Select
                  value={form.status}
                  label="상태"
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <MenuItem value="TODO">할 일</MenuItem>
                  <MenuItem value="IN_PROGRESS">진행 중</MenuItem>
                  <MenuItem value="REVIEW">검토</MenuItem>
                  <MenuItem value="DONE">완료</MenuItem>
                  <MenuItem value="HOLD">보류</MenuItem>
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
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="실제 소요 시간"
                value={form.actual_hours || ""}
                onChange={(e) =>
                  handleChange("actual_hours", Number(e.target.value))
                }
                InputProps={{ inputProps: { min: 0, step: 0.5 } }}
              />
            </Grid>

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
                  disabled={updateTaskMutation.isPending}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={updateTaskMutation.isPending}
                >
                  {updateTaskMutation.isPending ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      수정 중...
                    </>
                  ) : (
                    "저장"
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

export default withAuth(EditTaskPage); 