import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  Alert,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { withAuth } from "@/components/auth/withAuth";
import Layout from "@/components/layout/Layout";
import { client } from "@/lib/api/client";
import { authStore } from "@/stores/AuthStore";
import { toast } from "react-toastify";
import DepartmentForm from "@/components/departments/DepartmentForm";

function generateDepartmentCode(isTeam: boolean, lastCode: string | null) {
  const prefix = isTeam ? 'T' : 'D';
  if (!lastCode) {
    return `${prefix}001`;
  }
  
  const lastNumber = parseInt(lastCode.slice(1));
  return `${prefix}${String(lastNumber + 1).padStart(3, '0')}`;
}

function DepartmentManagePage() {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [isTeam, setIsTeam] = useState(false);

  // 권한 체크
  const canManageDepartments = authStore.user?.role === "ADMIN" || 
                              authStore.user?.rank === "DIRECTOR";

  // 부서 목록 조회
  const { data: departments, isLoading } = useQuery({
    queryKey: ["departments", tabValue],
    queryFn: async () => {
      const response = await client.get("/api/departments/");
      return response.data;
    },
  });

  // 본부와 팀 분리
  const headquarters = departments?.filter((dept: any) => dept.parent === null) || [];
  const teams = departments?.filter((dept: any) => dept.parent !== null) || [];

  // 팀을 본부별로 그룹화
  const teamsByHQ = headquarters.reduce((acc: any, hq: any) => {
    acc[hq.id] = teams.filter((team: any) => team.parent === hq.id);
    return acc;
  }, {});

  // 부서 등록/수정 mutation
  const departmentMutation = useMutation({
    mutationFn: async (deptData: any) => {
      // 새로운 부서/팀 등록 시 코드 생성
      if (!selectedDept) {
        const lastDept = departments
          ?.filter((d: any) => isTeam ? d.parent !== null : d.parent === null)
          ?.sort((a: any, b: any) => b.code.localeCompare(a.code))[0];
        
        deptData.code = generateDepartmentCode(isTeam, lastDept?.code);
      }

      if (selectedDept) {
        const response = await client.patch(
          `/api/departments/${selectedDept.id}/`, 
          deptData
        );
        return response.data;
      } else {
        const response = await client.post("/api/departments/", deptData);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setOpenForm(false);
      setSelectedDept(null);
      toast.success(
        selectedDept ? 
          (isTeam ? "팀 정보가 수정되었습니다." : "본부 정보가 수정되었습니다.") : 
          (isTeam ? "새 팀이 등록되었습니다." : "새 본부가 등록되었습니다.")
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "오류가 발생했습니다.");
    },
  });

  // 부서 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: async (deptId: number) => {
      await client.delete(`/api/departments/${deptId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setOpenDeleteDialog(false);
      toast.success(isTeam ? "팀이 삭제되었습니다." : "본부가 삭제되었습니다.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "삭제 중 오류가 발생했습니다.");
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setIsTeam(newValue === 1);
  };

  const handleEdit = (dept: any) => {
    setSelectedDept(dept);
    setOpenForm(true);
  };

  const handleDelete = (dept: any) => {
    setSelectedDept(dept);
    setOpenDeleteDialog(true);
  };

  const handleSubmit = (data: any) => {
    departmentMutation.mutate(data);
  };

  if (!canManageDepartments) {
    return (
      <Layout>
        <Box p={3}>
          <Alert severity="error">
            부서 관리 권한이 없습니다.
          </Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">부서/팀 관리</Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              setSelectedDept(null);
              setOpenForm(true);
            }}
          >
            {isTeam ? "팀 등록" : "본부 등록"}
          </Button>
        </Box>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="본부 관리" />
          <Tab label="팀 관리" />
        </Tabs>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>코드</TableCell>
                <TableCell>{isTeam ? "팀명" : "본부명"}</TableCell>
                {isTeam && <TableCell>소속 본부</TableCell>}
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isTeam ? (
                // 팀 목록 표시
                headquarters.map((hq: any) => (
                  <>
                    <TableRow key={`hq-${hq.id}`} sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell colSpan={4}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {hq.name}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {teamsByHQ[hq.id]?.map((team: any) => (
                      <TableRow key={team.id}>
                        <TableCell>{team.code}</TableCell>
                        <TableCell>{team.name}</TableCell>
                        <TableCell>{hq.name}</TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => handleEdit(team)} size="small">
                            <Edit />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDelete(team)} 
                            size="small"
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ))
              ) : (
                // 본부 목록 표시
                headquarters.map((dept: any) => (
                  <TableRow key={dept.id}>
                    <TableCell>{dept.code}</TableCell>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleEdit(dept)} size="small">
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(dept)} 
                        size="small"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 부서/팀 등록/수정 폼 다이얼로그 */}
        <DepartmentForm
          open={openForm}
          onClose={() => {
            setOpenForm(false);
            setSelectedDept(null);
          }}
          onSubmit={handleSubmit}
          initialData={selectedDept}
          isTeam={isTeam}
        />

        {/* 삭제 확인 다이얼로그 */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              {isTeam ? "팀 삭제" : "본부 삭제"}
            </Typography>
            <Typography>
              정말 삭제하시겠습니까?
            </Typography>
            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <Button onClick={() => setOpenDeleteDialog(false)}>
                취소
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => selectedDept && deleteMutation.mutate(selectedDept.id)}
              >
                삭제
              </Button>
            </Box>
          </Box>
        </Dialog>
      </Box>
    </Layout>
  );
}

export default withAuth(DepartmentManagePage); 