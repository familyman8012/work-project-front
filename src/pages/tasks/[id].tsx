import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { withAuth } from "@/components/auth/withAuth";
import Layout from "@/components/layout/Layout";
import { client } from "@/lib/api/client";
import { Task, TaskStatus, TaskPriority, TaskDifficulty } from "@/types/type";
import { format } from "date-fns";
import TaskComments from "@/components/tasks/TaskComments";
import TaskTimeLog from "@/components/tasks/TaskTimeLog";
import TaskHistory from "@/components/tasks/TaskHistory";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { toast } from "react-toastify";
import TaskEvaluation from "@/components/tasks/TaskEvaluation";
import { authStore } from "@/stores/AuthStore";

function TaskDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});

  // 작업 상세 정보 조회
  const { data: task, isLoading } = useQuery<Task>({
    queryKey: ["task", id],
    queryFn: async () => {
      const response = await client.get(`/api/tasks/${id}/`);
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 1000 * 30, // 30초마다 갱신
  });

  // 작업 수정 mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: Partial<Task>) => {
      const response = await client.patch(`/api/tasks/${id}/`, updatedTask);
      return response.data;
    },
    onSuccess: async () => {
      // 작업 정보와 히스토리를 함께 갱신
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["task", id] }),
        queryClient.invalidateQueries({
          queryKey: ["taskHistory", Number(id)],
        }),
        queryClient.refetchQueries({
          queryKey: ["taskHistory", Number(id)],
          exact: true,
        }),
      ]);
      setEditMode(false);
      setError(null);
    },
    onError: (error: any) => {
      setError(
        error.response?.data?.detail || "작업 수정 중 오류가 발생했습니다."
      );
    },
  });

  // handleEditChange 함수 추가
  const handleEditChange = (field: string, value: any) => {
    setEditedTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 작업 삭제 mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      await client.delete(`/api/tasks/${id}/`);
    },
    onSuccess: () => {
      // 작업 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      // 작업 상세 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      toast.success("작업이 삭제되었습니다.");
      router.push("/tasks");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "작업 삭제 중 오류가 발생했습니다."
      );
    },
  });

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteTaskMutation.mutate();
  };

  // 권한 체크 함수들
  const isOwnTask = () => {
    return task?.assignee === authStore.user?.id;
  };

  const isDepartmentSuperior = () => {
    if (!authStore.user || !task) return false;

    // 이사/본부장인 경우
    if (authStore.user.rank === "DIRECTOR" || authStore.user.rank === "GENERAL_MANAGER") {
      // 자신이 속한 본부의 id
      const userDeptId = authStore.user.department;
      
      // 작업 담당자의 부서 정보
      const taskDeptId = task.department;

      // 1. 본부장/이사 자신의 본부에 속한 직원의 작업인 경우
      if (userDeptId === taskDeptId) return true;

      // 2. 산하 팀에 속한 직원의 작업인 경우
      // organizations_department 테이블에서 parent_id가 본부장의 부서 id인 경우
      const isSubDepartment = task.department_parent_id === userDeptId;
      if (isSubDepartment) return true;

      return false;
    }

    // 팀장인 경우
    if (authStore.user.role === "MANAGER") {
      // 같은 팀 소속인 경우에만 true
      return task.department === authStore.user.department;
    }

    return false;
  };

  const isAdmin = () => {
    return authStore.user?.role === "ADMIN";
  };

  // 수정 버튼 표시 여부
  const showEditButton = () => {
    if (isAdmin()) return true;
    if (isDepartmentSuperior() && !isOwnTask()) return true;
    return false;
  };

  // 인라인 수정 가능 여부
  const canInlineEdit = () => {
    return isOwnTask() || (isDepartmentSuperior() && isOwnTask());
  };

  // 수정 페이지로 이동
  const handleEditClick = () => {
    router.push(`/tasks/edit/${id}`);
  };

  // 인라인 편집 가능한 필드인지 확인
  const canEditField = (fieldName: string) => {
    if (!canInlineEdit() || !task) return false;

    // 대표는 모든 필드 수정 가능
    if (isAdmin()) {
      return true;
    }

    // 이사/본부장은 자신의 작업과 부서 내 작업의 우선순위 수정 가능
    if (authStore.user?.rank === "DIRECTOR" || authStore.user?.rank === "GENERAL_MANAGER") {
      if (task?.department === authStore.user.department) {
        if (isOwnTask()) {
          return ["status", "actual_hours", "difficulty", "priority"].includes(fieldName);
        }
        return ["priority"].includes(fieldName);
      }
    }

    // 팀장은 자신의 작업과 부서 내 작업의 우선순위 수정 가능
    if (authStore.user?.role === "MANAGER") {
      if (task?.department === authStore.user.department) {
        if (isOwnTask()) {
          return ["status", "actual_hours", "difficulty", "priority"].includes(fieldName);
        }
        return ["priority"].includes(fieldName);
      }
    }

    // 일반 팀원은 자신의 작업만 수정 가능
    if (isOwnTask()) {
      return ["status", "actual_hours", "difficulty"].includes(fieldName);
    }

    return false;
  };

  // 변경사항 저장
  const handleSave = async () => {
    if (Object.keys(editedTask).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      await updateTaskMutation.mutateAsync(editedTask);
      setIsEditing(false);
      setEditedTask({});
      toast.success("작업이 수정되었습니다.");
    } catch (error) {
      console.error("Failed to save changes:", error);
      toast.error("작업 수정에 실패했습니다.");
    }
  };

  if (isLoading) {
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

  if (!task) {
    return (
      <Layout>
        <Box p={3}>
          <Alert severity="error">작업을 찾을 수 없습니다.</Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box p={3}>
        <Paper sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h5" component="h1">
              {task.title}
            </Typography>
            <Box>
               {/* 인라인 수정 버튼 (자신의 작업인 경우) */}
               {canInlineEdit() && !isEditing && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  sx={{ mr: 1 }}
                 
                >
                  Quick 수정
                </Button>
              )} 
               {/* 인라인 수정 중인 경우의 버튼들 */}
               {isEditing && (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedTask({});
                    }}
                    sx={{ mr: 1 }}
                  >
                    취소
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    sx={{ mr: 1 }}
                  >
                    저장
                  </Button>
                </>
              )}
              
             

              {/* 삭제 버튼 (관리자 또는 부서 상급자인 경우) */}
              {(isAdmin() || isDepartmentSuperior()) && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteClick}
                  sx={{ mr: 1 }}
                >
                  삭제
                </Button>
              )} 
              
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                담당자
              </Typography>
              <Typography>{task.assignee_full_name}</Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                시작일
              </Typography>
              <Typography>
                {format(new Date(task.start_date), "yyyy-MM-dd")}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                마감일
              </Typography>
              <Typography>
                {format(new Date(task.due_date), "yyyy-MM-dd")}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              
              {isEditing && canEditField("status") ? (
                <FormControl fullWidth>
              <InputLabel>상태</InputLabel>
                <Select
                  value={editedTask.status || task.status}
                  label="상태"
                  onChange={(e) => handleEditChange("status", e.target.value)}
                >
                  <MenuItem value="TODO">할 일</MenuItem>
                  <MenuItem value="IN_PROGRESS">진행 중</MenuItem>
                  <MenuItem value="REVIEW">검토</MenuItem>
                  <MenuItem value="DONE">완료</MenuItem>
                  <MenuItem value="HOLD">보류</MenuItem>
                </Select>
                </FormControl>
              ) : (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    상태
                  </Typography>
                  <Typography variant="body1">
                    {getStatusText(task.status)}
                  </Typography>
                </Box>
              )}
           
          </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                설명
              </Typography>
              <Typography>{task.description}</Typography>
            </Grid>
           
     


            <Grid item xs={12} md={3}>
             
                {isEditing && canEditField("priority") ? (
                   <FormControl fullWidth>
                <InputLabel>우선순위</InputLabel>
                  <Select
                    value={editedTask.priority || task.priority}
                    label="우선순위"
                    onChange={(e) => handleEditChange("priority", e.target.value)}
                  >
                    <MenuItem value="LOW">낮음</MenuItem>
                    <MenuItem value="MEDIUM">중간</MenuItem>
                    <MenuItem value="HIGH">높음</MenuItem>
                    <MenuItem value="URGENT">긴급</MenuItem>
                  </Select>
                  </FormControl>
                ) : (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      우선순위
                    </Typography>
                    <Typography variant="body1">
                      {getPriorityText(task.priority)}
                    </Typography>
                  </Box>
                )}
            
            </Grid>

       
            

            <Grid item xs={12} md={3}>
              {isEditing && canEditField("actual_hours") ? (
                <TextField
                  fullWidth
                  type="number"
                  label="실제 소요 시간"
                  value={editedTask.actual_hours ?? task.actual_hours ?? ""}
                  onChange={(e) => handleEditChange("actual_hours", Number(e.target.value))}
                  InputProps={{ inputProps: { min: 0, step: 0.5 } }}
                />
              ) : (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    실제 소요 시간
                  </Typography>
                  <Typography>
                    {task.actual_hours || 0} 시간
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                {isEditing && canEditField("difficulty") ? (
                  <>
                    <InputLabel>난이도</InputLabel>
                    <Select
                      value={editedTask.difficulty || task.difficulty}
                      label="난이도"
                      onChange={(e) => handleEditChange("difficulty", e.target.value)}
                    >
                      <MenuItem value="EASY">쉬움</MenuItem>
                      <MenuItem value="MEDIUM">보통</MenuItem>
                      <MenuItem value="HARD">어려움</MenuItem>
                      <MenuItem value="VERY_HARD">매우 어려움</MenuItem>
                    </Select>
                  </>
                ) : (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      난이도
                    </Typography>
                    <Typography>
                      {getDifficultyText(task.difficulty)}
                    </Typography>
                  </Box>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3} sx={{ display: "flex", justifyContent: "flex-end", height: "80%" }}>
           
              {/* 전체 수정 버튼 (관리자 또는 부서 상급자인 경우) */}
              {(isAdmin() || isDepartmentSuperior()) && (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                 
                >
                  전체 수정
                </Button>
              )}

            </Grid>

          </Grid>
        </Paper>
      </Box>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <TaskTimeLog taskId={Number(id)} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <TaskHistory taskId={Number(id)} />
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <TaskComments taskId={task.id} />
      </Box>

      {/* 작업 평가 섹션 추가 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <TaskEvaluation taskId={Number(id)} />
      </Paper>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>작업 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            이 작업을 삭제하시겠습니까? 이 작업과 관련된 모든 데이터(코멘트,
            시간 기록, 히스토리 등)가 함께 삭제됩니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleteTaskMutation.isPending}
          >
            {deleteTaskMutation.isPending ? "삭제 중..." : "삭제"}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

// 상태 텍스트 변환 함수
const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    TODO: "할 일",
    IN_PROGRESS: "진행 중",
    REVIEW: "검토",
    DONE: "완료",
    HOLD: "보류",
  };
  return statusMap[status] || status;
};

// 우선순위 텍스트 변환 함수
const getPriorityText = (priority: string) => {
  const priorityMap: { [key: string]: string } = {
    LOW: "낮음",
    MEDIUM: "중간",
    HIGH: "높음",
    URGENT: "긴급",
  };
  return priorityMap[priority] || priority;
};

// 난이도 텍스트 변환 함수
const getDifficultyText = (difficulty: string) => {
  const difficultyMap: { [key: string]: string } = {
    EASY: "쉬움",
    MEDIUM: "보통",
    HARD: "어려움",
    VERY_HARD: "매우 어려움",
  };
  return difficultyMap[difficulty] || difficulty;
};

export default withAuth(TaskDetailPage);
