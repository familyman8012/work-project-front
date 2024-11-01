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

interface TaskFiltersProps {
  filters: {
    status: TaskStatus | "";
    priority: TaskPriority | "";
    department: number | "";
    startDate: Date | null;
    endDate: Date | null;
    search: string;
  };
  departments: Array<{ id: number; name: string }>;
  onFilterChange: (name: string, value: any) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
}

const TaskFilters = ({
  filters,
  departments,
  onFilterChange,
  onSearchChange,
  onClearFilters,
}: TaskFiltersProps) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {/* 검색창 */}
        <TextField
          size="small"
          placeholder="작업 검색..."
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        />
        {/* 상태 필터 */}
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
        {/* 우선순위 필터 */}
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
        {/* 부서 필터 */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>부서</InputLabel>
          <Select
            value={filters.department}
            label="부서"
            onChange={(e) => onFilterChange("department", e.target.value)}
          >
            <MenuItem value="">전체</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
        {/* 필터 초기화 버튼 */}
        <IconButton onClick={onClearFilters} size="small">
          <Clear />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default TaskFilters;
