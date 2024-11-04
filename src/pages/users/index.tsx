import { useState, useEffect } from "react";
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
  Button,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { withAuth } from "@/components/auth/withAuth";
import Layout from "@/components/layout/Layout";
import { client } from "@/lib/api/client";
import { authStore } from "@/stores/AuthStore";

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
  { value: "GENERAL_MANAGER", label: "본부장" },
  { value: "DIRECTOR", label: "이사" },
];

function UsersPage() {
  const router = useRouter();
  const user = authStore.user;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState("");

  // 초기 필터 상태 설정
  const [filters, setFilters] = useState<Filters>(() => ({
    department:
      user && (user.rank === "DIRECTOR" || user.rank === "GENERAL_MANAGER")
        ? user.department.toString()
        : "",
    rank: "",
    search: "",
  }));

  // 직원 목록 조회
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", filters, page, rowsPerPage],
    queryFn: async () => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      params.append("page", String(page + 1));
      params.append("page_size", String(rowsPerPage));

      console.log("API Request params:", params.toString()); // 디버깅용
      const response = await client.get(`/api/users/?${params.toString()}`);
      console.log("API Response:", response.data); // 디버깅용
      return response.data;
    },
  });

  // 부서 목록 조회
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await client.get("/api/departments/");
      return response.data;
    },
  });

  // 부서 선택 옵션 구성
  const getDepartmentOptions = () => {
    if (!departments) return [];

    // 본부와 팀을 구분하여 표시
    const mainDepts = departments.filter((d: any) => d.parent === null);
    const options: JSX.Element[] = [];

    mainDepts.forEach((mainDept: any) => {
      // 본부 추가
      options.push(
        <MenuItem key={mainDept.id} value={mainDept.id.toString()}>
          {mainDept.name}
        </MenuItem>
      );

      // 산하 팀 추가 (들여쓰기로 구분)
      const childDepts = departments.filter(
        (d: any) => d.parent === mainDept.id
      );
      childDepts.forEach((childDept: any) => {
        options.push(
          <MenuItem key={childDept.id} value={childDept.id.toString()}>
            ㄴ {childDept.name}
          </MenuItem>
        );
      });
    });

    // 본부장/이사는 모든 부서를 볼 수 있음
    return options;
  };

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

  // 부서 검색 가능 여부 확인
  const canSearchDepartment =
    user?.role === "ADMIN" ||
    user?.rank === "DIRECTOR" ||
    user?.rank === "GENERAL_MANAGER";

  // 검색 안내 메시지
  const getSearchHelperText = () => {
    if (user?.role === "MANAGER") {
      return "* 이름 또는 사번으로 검색 가능합니다. 타 부서 직원은 검색되지 습니다.";
    }
    return "";
  };

  // 검색어 입력 핸들러
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // 검색 실행 핸들러
  const handleSearch = () => {
    handleFilterChange("search", searchInput);
  };

  // 엔터 키 핸들러
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
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
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  placeholder="이름(성/이름), 사번, 이메일로 검색..."
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  sx={{ minWidth: "80px" }}
                >
                  검색
                </Button>
              </Box>
            </Grid>
            {canSearchDepartment && (
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
                    {user?.role === "ADMIN" && (
                      <MenuItem value="">전체</MenuItem>
                    )}
                    {getDepartmentOptions()}
                  </Select>
                </FormControl>
              </Grid>
            )}
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
                        {user.last_name}
                        {user.first_name}
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
