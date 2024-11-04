import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Paper,
  InputAdornment,
} from "@mui/material";
import { Search, Clear } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ko from "date-fns/locale/ko";
import { TaskStatus, TaskPriority } from "@/types/type";
import { useState } from "react";

interface Department {
  id: number;
  name: string;
  parent: number | null;
  parent_name?: string;
}

interface TaskFiltersProps {
  filters: {
    status: TaskStatus | "";
    priority: TaskPriority | "";
    department?: number | "";
    startDate: Date | null;
    endDate: Date | null;
    search: string;
  };
  departments?: Department[];
  onFilterChange: (name: string, value: any) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  hideFilters?: string[];
  currentUserDepartment?: number;
}

const TaskFilters = ({
  filters,
  departments = [],
  onFilterChange,
  onSearchChange,
  onClearFilters,
  hideFilters = [],
  currentUserDepartment,
}: TaskFiltersProps) => {
  // 검색어 임시 저장을 위한 state 추가
  const [searchInput, setSearchInput] = useState(filters.search);

  // 엔터키 처리
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // 검색어가 있을 경우 부서 필터를 초기화
      if (searchInput.trim()) {
        onFilterChange("department", ""); // 부서 필터를 모든 부서로 설정
      }
      onSearchChange(searchInput);
    }
  };

  // 검색어 입력 처리
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // 부서 선택 처리
  const handleDepartmentChange = (e: any) => {
    // 부서가 선택되면 검색어 초기화
    if (e.target.value !== "") {
      setSearchInput(""); // 검색어 입력창 초기화
      onSearchChange(""); // 검색 필터 초기화
    }
    onFilterChange("department", e.target.value);
  };

  // 부서 계층 구조 생성
  const organizeHierarchy = (depts: Department[]) => {
    // 본부들 (parent가 null인 부서들)
    const headquarters = depts.filter((dept) => dept.parent === null);

    // 각 본부의 하위 팀들 찾기
    const getTeams = (hqId: number) => {
      return depts.filter((dept) => dept.parent === hqId);
    };

    return headquarters.map((hq) => ({
      ...hq,
      teams: getTeams(hq.id),
    }));
  };

  const hierarchicalDepts = organizeHierarchy(departments);

  // 부서 옵션 렌더링
  const renderDepartmentOptions = () => {
    const options: JSX.Element[] = [
      <MenuItem key="all" value="">
        모든 부서
      </MenuItem>,
    ];

    hierarchicalDepts.forEach((hq) => {
      // 본부 레벨 (구분선으로 강조)
      options.push(
        <MenuItem
          key={hq.id}
          value={hq.id}
          sx={{
            fontWeight: "bold",
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor:
              hq.id === currentUserDepartment ? "action.selected" : "inherit",
            "&:hover": {
              backgroundColor:
                hq.id === currentUserDepartment
                  ? "action.selected"
                  : "action.hover",
            },
          }}
        >
          📂 {hq.name}
        </MenuItem>
      );

      // 해당 본부의 하위 팀들
      hq.teams?.forEach((team) => {
        options.push(
          <MenuItem
            key={team.id}
            value={team.id}
            sx={{
              pl: 4,
              backgroundColor:
                team.id === currentUserDepartment
                  ? "action.selected"
                  : "inherit",
              "&:hover": {
                backgroundColor:
                  team.id === currentUserDepartment
                    ? "action.selected"
                    : "action.hover",
              },
            }}
          >
            └ {team.name}
          </MenuItem>
        );
      });
    });

    return options;
  };

  // 필터 초기화 처리 수정
  const handleClearFilters = () => {
    setSearchInput(""); // 검색어 입력창 초기화 추가
    onClearFilters();
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {/* 검색창 수정 */}
        <TextField
          size="small"
          placeholder={`작업명 ${
            !hideFilters.includes("department") ? "또는 담당자 이름으로" : ""
          } 검색 후 엔터`}
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
          sx={{ minWidth: 370 }}
        />
        {/* 상태 필터 */}
        {!hideFilters.includes("status") && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>상태</InputLabel>
            <Select
              value={filters.status}
              label="상태"
              onChange={(e) => onFilterChange("status", e.target.value)}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="TODO">할 일</MenuItem>
              <MenuItem value="IN_PROGRESS">진행중</MenuItem>
              <MenuItem value="REVIEW">검토중</MenuItem>
              <MenuItem value="DONE">완료</MenuItem>
              <MenuItem value="HOLD">보류</MenuItem>
            </Select>
          </FormControl>
        )}
        {/* 우선순위 필터 */}
        {!hideFilters.includes("priority") && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>우선순위</InputLabel>
            <Select
              value={filters.priority}
              label="우선순위"
              onChange={(e) => onFilterChange("priority", e.target.value)}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="LOW">낮음</MenuItem>
              <MenuItem value="MEDIUM">중간</MenuItem>
              <MenuItem value="HIGH">높음</MenuItem>
              <MenuItem value="URGENT">긴급</MenuItem>
            </Select>
          </FormControl>
        )}
        {/* 부서 필터 */}
        {!hideFilters.includes("department") && departments && (
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel>부서</InputLabel>
            <Select
              value={filters.department}
              label="부서"
              onChange={handleDepartmentChange}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 400,
                  },
                },
              }}
            >
              {renderDepartmentOptions()}
            </Select>
          </FormControl>
        )}
      </Box>
      <Box
        sx={{ display: "flex", gap: 2, flexWrap: "wrap", marginTop: "20px" }}
      >
        {/* 날짜 범위 필터 */}
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
          <DatePicker
            label="시작일"
            value={filters.startDate}
            onChange={(date) => onFilterChange("startDate", date)}
            slotProps={{ textField: { size: "small" } }}
          />
          <DatePicker
            label="종료일"
            value={filters.endDate}
            onChange={(date) => onFilterChange("endDate", date)}
            slotProps={{ textField: { size: "small" } }}
          />
        </LocalizationProvider>
        {/* 필 초기화 버튼 */}
        <IconButton onClick={handleClearFilters} size="small">
          <Clear />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default TaskFilters;
