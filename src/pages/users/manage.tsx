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
  TablePagination,
  Alert,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Edit, Delete, Search } from "@mui/icons-material";
import { withAuth } from "@/components/auth/withAuth";
import Layout from "@/components/layout/Layout";
import { client } from "@/lib/api/client";
import { authStore } from "@/stores/AuthStore";
import { toast } from "react-toastify";
import { getRankText } from "@/lib/getRankText";
import UserForm from "@/components/users/UserForm";

function UserManagePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openForm, setOpenForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 권한 체크
  const canManageUsers = authStore.user?.role === "ADMIN" || 
                        authStore.user?.rank === "DIRECTOR" ||
                        authStore.user?.rank === "GENERAL_MANAGER";

  // 직원 목록 조회
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", page, rowsPerPage, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page + 1),
        page_size: String(rowsPerPage),
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await client.get(`/api/users/?${params.toString()}`);
      return response.data;
    },
  });

  // 직원 등록/수정 mutation
  const userMutation = useMutation({
    mutationFn: async (userData: any) => {
      if (selectedUser) {
        // 수정
        const response = await client.patch(`/api/users/${selectedUser.id}/`, userData);
        return response.data;
      } else {
        // 등록
        const response = await client.post("/api/users/", userData);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpenForm(false);
      setSelectedUser(null);
      toast.success(selectedUser ? "직원 정보가 수정되었습니다." : "직원이 등록되었습니다.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "오류가 발생했습니다.");
    },
  });

  // 직원 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      await client.delete(`/api/users/${userId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpenDeleteDialog(false);
      toast.success("직원이 삭제되었습니다.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "삭제 중 오류가 발생했습니다.");
    },
  });

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setOpenForm(true);
  };

  const handleDelete = (user: any) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleSubmit = (data: any) => {
    userMutation.mutate(data);
  };

  // 검색어 핸들러
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // 검색 시 첫 페이지로 이동
  };

  if (!canManageUsers) {
    return (
      <Layout>
        <Box p={3}>
          <Alert severity="error">
            직원 관리 권한이 없습니다.
          </Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">직원 관리</Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              setSelectedUser(null);
              setOpenForm(true);
            }}
          >
            직원 등록
          </Button>
        </Box>

        {/* 검색 필터 추가 */}
        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="직원 이름으로 검색..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>사번</TableCell>
                <TableCell>이름</TableCell>
                <TableCell>부서</TableCell>
                <TableCell>직급</TableCell>
                <TableCell>이메일</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersData?.results.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.employee_id}</TableCell>
                  <TableCell>{user.last_name}{user.first_name}</TableCell>
                  <TableCell>{user.department_name}</TableCell>
                  <TableCell>{getRankText(user.rank)}</TableCell>
                  <TableCell>{user.email}</TableCell>
                 
                  <TableCell align="center">
                    <IconButton onClick={() => handleEdit(user)} size="small">
                      <Edit />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(user)} 
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={usersData?.count || 0}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>

        {/* 직원 등록/수정 폼 다이얼로그 */}
        <UserForm
          open={openForm}
          onClose={() => {
            setOpenForm(false);
            setSelectedUser(null);
          }}
          onSubmit={handleSubmit}
          initialData={selectedUser}
        />

        {/* 삭제 확인 다이얼로그 */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              직원 삭제
            </Typography>
            <Typography>
              정말 이 직원을 삭제하시겠습니까?
            </Typography>
            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <Button onClick={() => setOpenDeleteDialog(false)}>
                취소
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => selectedUser && deleteMutation.mutate(selectedUser.id)}
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

export default withAuth(UserManagePage); 