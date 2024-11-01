import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { withAuth } from "@/components/auth/withAuth";
import Layout from "@/components/layout/Layout";
import { client } from "@/lib/api/client";

interface Filters {
  department: string;
  rank: string;
  search: string;
}

const initialFilters: Filters = {
  department: "",
  rank: "",
  search: "",
};

const RANK_OPTIONS = [
  { value: "STAFF", label: "사원" },
  { value: "SENIOR", label: "주임" },
  { value: "ASSISTANT_MANAGER", label: "대리" },
  { value: "MANAGER", label: "과장" },
  { value: "DEPUTY_GENERAL_MANAGER", label: "차장" },
  { value: "GENERAL_MANAGER", label: "부장" },
  { value: "DIRECTOR", label: "이사" },
];

function UsersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 부서 목록 조회
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await client.get("/api/departments/");
      return response.data;
    },
  });

  // 직원 목록 조회
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", filters, page, rowsPerPage],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.department) params.append("department", filters.department);
      if (filters.rank) params.append("rank", filters.rank);
      if (filters.search) params.append("search", filters.search);

      params.append("page", String(page + 1));
      params.append("page_size", String(rowsPerPage));

      const response = await client.get(`/api/users/?${params.toString()}`);
      return response.data;
    },
  });

  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(0); // 필터 변경 시 첫 페이지로 이동
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (userId: number) => {
    router.push(`/users/${userId}`);
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          직원 목록
        </Typography>

        {/* 필터 섹션 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                placeholder="이름, 사번으로 검색..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>부서</InputLabel>
                <Select
                  value={filters.department}
                  label="부서"
                  onChange={(e) =>
                    handleFilterChange("department", e.target.value)
                  }
                >
                  <MenuItem value="">전체</MenuItem>
                  {departments.map((dept: any) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>직급</InputLabel>
                <Select
                  value={filters.rank}
                  label="직급"
                  onChange={(e) => handleFilterChange("rank", e.target.value)}
                >
                  <MenuItem value="">전체</MenuItem>
                  {RANK_OPTIONS.map((rank) => (
                    <MenuItem key={rank.value} value={rank.value}>
                      {rank.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* 직원 목록 테이블 */}
        <TableContainer component={Paper}>
          {isLoading ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>사번</TableCell>
                    <TableCell>이름</TableCell>
                    <TableCell>부서</TableCell>
                    <TableCell>직급</TableCell>
                    <TableCell>이메일</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usersData?.results.map((user: any) => (
                    <TableRow
                      key={user.id}
                      hover
                      onClick={() => handleRowClick(user.id)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>{user.employee_id}</TableCell>
                      <TableCell>
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.department_name}</TableCell>
                      <TableCell>
                        {RANK_OPTIONS.find((r) => r.value === user.rank)?.label}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
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
                labelRowsPerPage="페이지당 행 수"
              />
            </>
          )}
        </TableContainer>
      </Box>
    </Layout>
  );
}

export default withAuth(UsersPage);
