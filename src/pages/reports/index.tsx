import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  FormControl,
  TextField,
  Tab,
  Tabs,
  Chip,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ko } from "date-fns/locale";
import { withAuth } from "@/components/auth/withAuth";
import Layout from "@/components/layout/Layout";
import { client } from "@/lib/api/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { format } from "date-fns";
import { authStore } from "@/stores/AuthStore";
import { useRouter } from "next/router";
import { getRankText } from "@/lib/getRankText";
import { toast } from "react-toastify";
import { performanceAnalysis } from "@/lib/reports/performanceAnalysis";

interface PersonalReport {
  basic_stats: {
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    delayed_tasks: number;
  };
  time_stats: {
    average_completion_time: string;
    estimated_vs_actual: number;
    daily_work_hours: Array<{
      date: string;
      hours: number;
    }>;
  };
  quality_stats: {
    average_score: number;
    review_rejection_rate: number;
    rework_rate: number;
  };
  distribution_stats: {
    priority_distribution: Array<{
      priority: string;
      count: number;
    }>;
    difficulty_distribution: Array<{
      difficulty: string;
      count: number;
    }>;
    status_distribution: Array<{
      status: string;
      count: number;
    }>;
  };
  comparison_stats?: {
    team_comparison: {
      team_avg_completion_time: string;
      team_avg_score: number;
    };
    department_comparison: {
      dept_avg_completion_time: string;
      dept_avg_score: number;
    };
  };
}

function PersonalReportPage() {
  const router = useRouter();
  const { id } = router.query; // URL에서 직원 ID 가져오기
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [currentTab, setCurrentTab] = useState(0);

  // 직원 목록 조회
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await client.get("/api/users/");
      return response.data;
    },
  });

  // 개인 보고서 데이터 조회
  const { data: report, isLoading } = useQuery<PersonalReport>({
    queryKey: ["personalReport", selectedUserId, startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) throw new Error("날짜를 선택해주세요");

      const params = new URLSearchParams({
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
      });

      if (selectedUserId && selectedUserId !== String(authStore.user?.id)) {
        params.append("employee_id", selectedUserId);
      }

      try {
        const response = await client.get(`/api/reports/personal_report/?${params.toString()}`);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 403) {
          toast.error("해당 직원의 보고서에 대한 접근 권한이 없습니다.");
        } else {
          toast.error("보고서를 러오는 중 오류가 생습니다.");
        }
        throw error;
      }
    },
    enabled: !!startDate && !!endDate,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  if (isLoading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box p={3}>
        <Typography variant="h5" gutterBottom>
          작업 보고서
        </Typography>

        {/* 필터 영역 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            {/* 직원 선택 필터 추가 */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>직원 선택</InputLabel>
                <Select
                  value={selectedUserId}
                  label="직원 선택"
                  onChange={(e) => setSelectedUserId(e.target.value as string)}
                >
                  <MenuItem value="">내 보고서</MenuItem>
                  {users?.results.map((user: any) => (
                    // 자신은 제외하고 표시
                    user.id !== authStore.user?.id && (
                      <MenuItem key={user.id} value={user.id}>
                        {user.department_name} - {user.last_name}{user.first_name} ({getRankText(user.rank)})
                      </MenuItem>
                    )
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 기존 날짜 선택 필터 */}
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DatePicker
                  label="시작일"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DatePicker
                  label="종료일"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Paper>

        {report ? (
          <>
            {/* 탭 뉴 */}
            <Paper sx={{ mb: 3 }}>
              <Tabs value={currentTab} onChange={handleTabChange}>
                <Tab label="기본 통계" />
                <Tab label="시간 관리" />
                <Tab label="품질 지표" />
                <Tab label="작업 분포" />
                {report.comparison_stats && <Tab label="비교 분석" />}
              </Tabs>
            </Paper>

            {/* 탭 컨텐츠 */}
            {currentTab === 0 && (
              <BasicStats stats={report.basic_stats} />
            )}
            {currentTab === 1 && (
              <TimeStats stats={report.time_stats} />
            )}
            {currentTab === 2 && (
              <QualityStats stats={report.quality_stats} />
            )}
            {currentTab === 3 && (
              <DistributionStats stats={report.distribution_stats} />
            )}
            {currentTab === 4 && report.comparison_stats && (
              <ComparisonStats stats={report.comparison_stats} />
            )}
          </>
        ) : (
          <Alert severity="info">
            날짜를 선택하여 보고서를 조회해주세요.
          </Alert>
        )}
      </Box>
    </Layout>
  );
}

// 기본 통계 컴포넌트
function BasicStats({ stats }: { stats: PersonalReport["basic_stats"] }) {
  if (stats.total_tasks === 0) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                전체 작업
              </Typography>
              <Typography variant="h4">0</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              작업 현황 안내
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {`현재 배정된 작업이 없습니다. 이는 다음과 같은 상황일 수 있습니다:

              • 신규 프로젝트 착수 준비 단계
              • 이전 작업들의 완료 후 과도기적 시점
              • 작업 배정 프로세스 상의 검토 필요 시점

              이 시간을 다음과 같이 활용하실 것을 제안드립니다:

              1. 역량 개발
                • 업무 관련 교육 및 훈련 참여
                • 새로운 기술 및 도구 학습
                • 자격증 취득 준비

              2. 업무 프로세스 개선
                • 기존 업무 수 방식 분석
                • 업무 매뉴얼 및 가이드라인 정비
                • 업무 자동화 방안 연구

              3. 향후 준비
                • 예상 작업에 대한 사전 조사
                • 필요 역량 및 리소스 파악
                • 일정 관리 체계 점검`}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  const getDetailedAnalysis = () => {
    if (stats.total_tasks === 0) {
      return `
        ${format(new Date(), 'yyyy년 MM월')} 업무 실적 보고서

        1. 현재 상태
        현재 배정된 작업이 없는 상태입니다. 이는 다음과 같은 상황일 수 있습니다:
        
        - 신규 프로젝트 착수 준비 단계
        - 이전 작업들의 완료 후 과도기적 시점
        - 작업 배정 프로세스 상의 검토 필요 시점

        2. 활용 방안
        현재 시점을 다음과 같이 효과적으로 활용할 수 있습니다:

        1) 역량 개 기회
           - 업무 관련 교육 및 훈련 참여
           - 새로운 기술 및 도구 학습
           - 자격증 취득 준비

        2) 업무 프로세스 개선
           - 기존 업무 수행 방식 분석 및 개선점 도출
           - 업무 매뉴얼 및 가이드라인 정비
           - 업무 자동화 방안 연구

        3) 향후 준비사항
           - 향후 예상 작업에 대한 사전 조사 및 준비
           - 필요 역량 및 리소스 파악
           - 일정 및 우선순위 관리 체계 점검
      `;
    }

    const completionRate = stats.total_tasks ? (stats.completed_tasks / stats.total_tasks) * 100 : 0;
    const delayRate = stats.total_tasks ? (stats.delayed_tasks / stats.total_tasks) * 100 : 0;
    const inProgressRate = stats.total_tasks ? (stats.in_progress_tasks / stats.total_tasks) * 100 : 0;

    return `
      ${format(new Date(), 'yyyy년 MM월')} 업무 실적 보고서

      1. 업무 현황 개요
      현재 총 ${stats.total_tasks}건의 업무를 담당하고 있으며, 이 중 ${stats.completed_tasks}건(${completionRate.toFixed(1)}%)을 성공적으로 완료하였습니다. 
      진행 중인 업무는 ${stats.in_progress_tasks}건(${inProgressRate.toFixed(1)}%)이며, 
      ${stats.delayed_tasks}건의 지연 업무가 발생하 전체 지연율은 ${delayRate.toFixed(1)}%를 기록하고 있습니다.

      2. 성과 분석
      ${getPerformanceInsight(completionRate, delayRate)}

      3. 업무 부하 분석
      ${getWorkloadAnalysis(stats.in_progress_tasks)}

      4. 개선 필요사항
      ${getImprovementSuggestions(stats)}

      5. 향후 계획 및 제언
      ${getRecommendations(stats)}
    `;
  };

  const getPerformanceInsight = (completionRate: number, delayRate: number) => {
    let insight = "";
    if (completionRate >= 90) {
      insight = "탁월한 업무 완수율을 보여주고 있으며, 특히 ";
    } else if (completionRate >= 70) {
      insight = "안정적인 업무 처리 능력을 보여주고 있으며, ";
    } else {
      insight = "업무 처리 효율성 개선의 여지가 있으며, ";
    }

    if (delayRate <= 5) {
      insight += "일정 준수율이 매우 우수합니다. 이는 체계적인 시간 관리와 업무 우선순위 설정 능력이 뛰어남을 보여줍니다.";
    } else if (delayRate <= 15) {
      insight += "일정 관리는 대체로 양호하나, 보다 철저한 일정 관리가 요구됩니다.";
    } else {
      insight += "일정 준수율 개선을 위한 체계적인 접근이 요한 상황입니다.";
    }

    return insight;
  };

  const getWorkloadAnalysis = (inProgressTasks: number) => {
    if (inProgressTasks > 8) {
      return `
        현재 진행 중인 ${inProgressTasks}건의 작업은 적정 업무량을 크게 초과하는 수준입니다. 
        업무 과중으로 인한 품질 저하와 일정 지연이 우려되는 상황으로, 다음과 같은 조치가 필요합니다:
        
        1. 긴급성과 중요도에 따른 작업 우선순위 재조정
        2. 팀 내 업무 재분배 또는 추가 인력 지원 검토
        3. 불필요한 회의나 부가 업무 최소화를 통한 핵심 업무 집중도 향상
      `;
    } else if (inProgressTasks > 5) {
      return `
        현재 진행 중인 ${inProgressTasks}건의 작업은 다소 높은 수준의 업무량을 나타냅니다.
        업무 부하가 증가하는 추세이므로, 다음과 같은 관리방안이 권장됩니다:
        
        1. 작업 간 우선순위 명확화
        2. 업무 간 관리 효율화
        3. 주기적인 진척상황 점검을 통한 선제적 스크 관리
      `;
    } else {
      return `
        현재 진행 중인 ${inProgressTasks}건의 작업은 적정 수준의 업무을 유지하고 있습니다.
        현재의 업무 배분이 효율적으로 이루어지고 있으며, 이러한 수준을 유지하면서 다음과 같은 점을 고려할 수 있습니다:
        
        1. 업무 난이도와 복잡성을 고려한 추가 작업 수용 가능성 검토
        2. 여유 시을 활용한 역량 개발 및 업무 프로세스 개선
        3. 팀 내 지식 공유 및 협업 강화
      `;
    }
  };

  const getImprovementSuggestions = (stats: PersonalReport["basic_stats"]) => {
    const suggestions = [];
    const completionRate = (stats.completed_tasks / stats.total_tasks) * 100;
    const delayRate = (stats.delayed_tasks / stats.total_tasks) * 100;

    // 지연 작업 관련 개선사항
    if (delayRate >= 30) {
      suggestions.push(`
        [심각 지연 작업 개선 최우선 과제]
        현재 ${stats.delayed_tasks}건(${delayRate.toFixed(1)}%)의 높은 지연율이 발생하고 있어 즉각적인 조치가 필요합니다:
        
        1. 긴급 태스크포스 구성
           - 지연 작업 전담 대응팀 구성
           - 일일 진척도 점검 및 보고체계 수립
        
        2. 원 재배치
           - 우선순위가 낮은 작업의 일시 중단 검토
           - 팀 내 가용 인력 지원 체계 마련
        
        3. 프로세스 개선
           - 병목구간 즉시 개선
           - 의사결정 단계 최소화
      `);
    } else if (delayRate >= 15) {
      suggestions.push(`
        [지연 작업 집중 관리 방안]
        ${stats.delayed_tasks}건(${delayRate.toFixed(1)}%)의 지연 작업에 대한 체계적인 관리가 필요합다:
        
        1. 지연 원인 분석
           - 작업별 지연 원인 상세 분석
           - 공통 지연 요인 도출
        
        2. 일정 관리 체계화
           - 주간 단위 마일스톤 설정
           - 중간 점검 절차 강화
      `);
    } else if (delayRate > 0) {
      suggestions.push(`
        [경미 지연 작업 관리 방안]
        ${stats.delayed_tasks}의 경미한 지연 상황에 대한 개선안:
        
        1. 예방적 조치
           - 리스크 조기 식별 체계 구축
           - 버퍼 시간 적절한 배분
      `);
    }

    // 진행중 작업 관련 개선사항
    if (stats.in_progress_tasks > 8) {
      suggestions.push(`
        [다 진행 작업 조정 방안]
        현재 ${stats.in_progress_tasks} 과다한 진행 작으 인한 스크 관리가 필요합니다:
        
        1. 작업 우선순위 재조정
           - 중요도/긴급도 매트릭스 기반 재분류
           - 불필요한 작업 중단 또는 연기
        
        2. 업무 집중도 향상
           - 코어타임 설정 및 준수
           - 업무 중단 요소 최소화
      `);
    }

    // 완료율 관련 개선사항
    if (completionRate < 50) {
      suggestions.push(`
        [낮은 완료율 개선 긴급 방안]
        ${completionRate.toFixed(1)}%의 저조한 완료율 개선을 위한 긴급 조치사항:
        
        1. 작업 완료 프로세스 전면 재검토
           - 병목구간 식별 및 제거
           - 의사결정 단계 간소화
        
        2. 업무 수행 역량 강화
           - 맞춤형 교육 프로그램 참여
           - 멘토링 시스템 도입
      `);
    } else if (completionRate < 70) {
      suggestions.push(`
        [료율 향상 방안]
        ${completionRate.toFixed(1)}%의 완료율 개선을 위한 제안사항:
        
        1. 작업 관리 체계화
           - 작업 단위 세분화
           - 진척도 관 강화
      `);
    }

    return suggestions.join('\n\n');
  };

  const getRecommendations = (stats: PersonalReport["basic_stats"]) => {
    const completionRate = (stats.completed_tasks / stats.total_tasks) * 100;
    
    return `
      [단기 실행과제]
      1. ${stats.delayed_tasks > 0 
           ? '지연 작업 해소를 위한 집중 관리 기간 운영' 
           : '현재의 우수한 일정 준수율 유지를 위한 업무 프로세스 표준화'}
      2. ${completionRate < 70 
           ? '업무 완료율 향상을 위한 태스크 관리 시스템 개선' 
           : '높은 업무 완료율을 활용한 모범 사례 공유 및 전파'}
      3. ${stats.in_progress_tasks > 5 
           ? '진행 중인 작업의 우선순위 재검토 및 조정' 
           : '추가 업무 수용을 위한 역량 개발 계획 수립'}

      [중장기 발전과제]
      1. 업무 수행 역량 고도화
         - 전문 강화를 위 교육 프로그램 참여
         - 업무 관련 자격증 취득 및 스킬 향상
      
      2. 프로젝트 관리 능력 배양
         - 복잡한 다중 작업 관리 능력 향상
         - 리스크 관리 및 의사소통 역량 강화
      
      3. 조직 기여도 확대
         - 부서 내 지식 활동 주도
         - 업무 프로세스 개선 제�� 활성화
    `;
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              전체 작업
            </Typography>
            <Typography variant="h4">{stats.total_tasks}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              완료된 작업
            </Typography>
            <Typography variant="h4">{stats.completed_tasks}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              진행중인 작업
            </Typography>
            <Typography variant="h4">{stats.in_progress_tasks}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              지연된 작업
            </Typography>
            <Typography variant="h4" color="error">
              {stats.delayed_tasks}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            상세 업무 분석 보고서
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-line',
              lineHeight: 1.8,
              color: 'text.secondary'
            }}
          >
            {getDetailedAnalysis()}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}

// 시간 관리 컴포넌트
function TimeStats({ stats }: { stats: PersonalReport["time_stats"] }) {
  if (!stats.daily_work_hours.length) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              시간 관리 데이터 없음
            </Typography>
            <Typography variant="body1">
              현재 기간 동안의 작업 시간 기록이 없습니다.
              작업이 시작되면 시간 관리 통계가 자동으로 생성됩니다.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  const getTimeAnalysis = () => {
    const efficiency = stats.estimated_vs_actual;
    
    return (
      <>
        <Typography variant="h6" gutterBottom>
          시간 관리 효율성 분석
        </Typography>
        
        <Typography variant="body1" paragraph>
          {`예상 대비 실제 소요 시간이 ${efficiency.toFixed(1)}%로, ${
            efficiency <= 100
              ? "매우 효율적으로 관리되고 있습니다."
              : efficiency <= 120
              ? "대체로 양호하나 일부 개선의 여지가 있습니다."
              : "상당한 개선이 필요한 상황입니다."
          }`}
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          주요 시사점
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 2 }}>
          {efficiency <= 100 ? [
            "정확한 작업 시간 추정 능력 보유",
            "체계적인 시간 관리 역량 입증",
            "효율적인 업무 처리 프로세스 구축"
          ] : efficiency <= 120 ? [
            "대체로 적절한 시간 관리 수행",
            "일부 작업에서 시간 추정 정확도 상 필요",
            "업무 프로세스 최적화 여 존재"
          ] : [
            "작업 시간 추정의 정확도 개선 필요",
            "업무 처리 효율성 저하 우려",
            "시간 관리 체계 재정립 검토 필요"
          ].map((item, index) => (
            <Typography component="li" key={index} paragraph>
              {item}
            </Typography>
          ))}
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          일별 작업 시간 패턴 분석
        </Typography>
        <Typography variant="body1" paragraph>
          {getWorkingPatternAnalysis(stats.daily_work_hours)}
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          개선 제안사항
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          {getImprovementSuggestions(efficiency).map((item, index) => (
            <Typography component="li" key={index} paragraph>
              {item}
            </Typography>
          ))}
        </Box>
      </>
    );
  };

  const getWorkingPatternAnalysis = (dailyHours: Array<{ date: string; hours: number }>) => {
    const avgHours = dailyHours.reduce((sum, day) => sum + day.hours, 0) / dailyHours.length;
    const maxHours = Math.max(...dailyHours.map(day => day.hours));
    const minHours = Math.min(...dailyHours.map(day => day.hours));
    const variance = dailyHours.reduce((sum, day) => sum + Math.pow(day.hours - avgHours, 2), 0) / dailyHours.length;

    return `일평균 ${avgHours.toFixed(1)}시간의 작업 시간을 기록하고 있으며, 
    최대 ${maxHours.toFixed(1)}시간에서 최소 ${minHours.toFixed(1)}시간까지 
    ${variance < 2 ? '비교적 안정적인' : '다소 변동이 큰'} 패턴을 보이고 있습니다. ${
      variance < 2 
        ? '안정적인 업무 리듬이 형성되어 있어 긍정적입니다.' 
        : '업무 시간의 안정적 관리를 위한 개선이 필요합니다.'
    }`;
  };

  const getImprovementSuggestions = (efficiency: number) => {
    if (efficiency <= 100) {
      return [
        "현재의 시간 관리 방식 문서화 및 표준화",
        "팀 내 시간 관리 노우 공유",
        "더 복잡한 프로젝트 수행 고려"
      ];
    } else if (efficiency <= 120) {
      return [
        "작업 시간 추정 정확도 향상을 위한 데이터 분석",
        "업무 프로세스 효율화 포인트 발굴",
        "시간 관리 도구 활용도 제고"
      ];
    } else {
      return [
        "작업 시간 추정 방식 면 재검토",
        "업무 프로세스 병목 구간 분석",
        "시간 관리 교육 프로그램 참여 검토",
        "멘토링 또는 코칭 지원 요청"
      ];
    }
  };

  return (
    <Grid container spacing={3}>
      {/* 기존 카드 컴포넌트들 */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            평균 완료 시간
          </Typography>
          <Typography variant="h4">
            {stats.average_completion_time || "-"}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            예상 대비 실제 시간
          </Typography>
          <Typography variant="h4">
            {stats.estimated_vs_actual.toFixed(1)}%
          </Typography>
        </Paper>
      </Grid>

      {/* 차트 */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            일별 작업 시간 추이
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={stats.daily_work_hours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#8884d8"
                  name="작업 시간"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      {/* 분석 리포트 */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          {getTimeAnalysis()}
        </Paper>
      </Grid>
    </Grid>
  );
}

// QualityStats 컴포넌트 수정
function QualityStats({ stats }: { stats: PersonalReport["quality_stats"] }) {
  const hasData = stats.average_score > 0;

  if (!hasData) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              품질 평가 데이터 없음
            </Typography>
            <Typography variant="body1">
              현재 기간 동안의 품질 평가 데이터가 없습니다.
              작업이 완료되고 평가가 이루어지면 품질 지표가 자동으로 생성됩니다.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  const getQualityLevel = (score: number) => {
    if (score >= 4.5) return performanceAnalysis.quality.exceptional;
    if (score >= 3.5) return performanceAnalysis.quality.satisfactory;
    if (score >= 2.5) return performanceAnalysis.quality.belowStandard;
    return performanceAnalysis.quality.critical;
  };

  const qualityLevel = getQualityLevel(stats.average_score);

  const getQualityAnalysis = () => {
    const { average_score, review_rejection_rate, rework_rate } = stats;
    
    return (
      <>
        <Typography variant="h6" gutterBottom>
          {qualityLevel.title}
        </Typography>
        <Typography variant="body1" paragraph>
          {qualityLevel.description}
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          주요 시사점
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          {qualityLevel.implications.map((item: string, index: number) => (
            <Typography component="li" key={index} paragraph>
              {item}
            </Typography>
          ))}
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          개선 제안사항
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          {qualityLevel.recommendations.map((item: string, index: number) => (
            <Typography component="li" key={index} paragraph>
              {item}
            </Typography>
          ))}
        </Box>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          세부 지표 분석
        </Typography>
        <Typography variant="body2" paragraph>
          {`검토 반려율이 ${review_rejection_rate.toFixed(1)}%로, ${
            review_rejection_rate > 20 
              ? '개선이 필요한 수준입니다.' 
              : review_rejection_rate > 10
              ? '주의가 필요한 수준입니다.'
              : '양호한 수준을 유지하고 있습니다.'
          }`}
        </Typography>
        <Typography variant="body2" paragraph>
          {`재작업률이 ${rework_rate.toFixed(1)}%로, ${
            rework_rate > 15
              ? '즉각적인 개선이 필요합니다.'
              : rework_rate > 8
              ? '지속적인 모니터링이 필요합니다.'
              : '효율적으로 관리되고 있습니다.'
          }`}
        </Typography>
      </>
    );
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              평균 평가 점수
            </Typography>
            <Typography variant="h4">
              {stats.average_score?.toFixed(1) || "-"} / 5.0
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              검토 반려율
            </Typography>
            <Typography variant="h4">
              {stats.review_rejection_rate.toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              재작업률
            </Typography>
            <Typography variant="h4">
              {stats.rework_rate.toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* 상세 분석 섹션 */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          {getQualityAnalysis()}
        </Paper>
      </Grid>
    </Grid>
  );
}

// 작업 분포 컴포넌트
function DistributionStats({
  stats,
}: {
  stats: PersonalReport["distribution_stats"];
}) {
  if (!stats.priority_distribution.length && 
      !stats.difficulty_distribution.length && 
      !stats.status_distribution.length) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              작업 분포 데이터 없음
            </Typography>
            <Typography variant="body1">
              현재 기간 동안의 작업 분포 데이터가 없습니다.
              작업이 배정되면 작업 분포 통계가 자동으로 생성됩니다.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const getDistributionAnalysis = () => {
    const priorityAnalysis = getPriorityAnalysis();
    const difficultyAnalysis = getDifficultyAnalysis();
    const statusAnalysis = getStatusAnalysis();

    return (
      <>
        <Typography variant="h6" gutterBottom>
          작업 분포 종합 분석
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
          우선순위 분포 분석
        </Typography>
        <Typography variant="body1" paragraph>
          {priorityAnalysis}
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          난이도 분포 분석
        </Typography>
        <Typography variant="body1" paragraph>
          {difficultyAnalysis}
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          상태 분포 분석
        </Typography>
        <Typography variant="body1" paragraph>
          {statusAnalysis}
        </Typography>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
          개선 제안사항
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          {getImprovement().map((item, index) => (
            <Typography component="li" key={index} paragraph>
              {item}
            </Typography>
          ))}
        </Box>
      </>
    );
  };

  const getPriorityAnalysis = () => {
    const total = stats.priority_distribution.reduce((sum, item) => sum + item.count, 0);
    const highPriorityItems = stats.priority_distribution
      .filter(item => ["HIGH", "URGENT"].includes(item.priority));
    const highPriorityRate = (highPriorityItems.reduce((sum, item) => sum + item.count, 0) / total) * 100;

    return `전체 작업 중 높은 우선순위(긴급/높음) 작업이 ${highPriorityRate.toFixed(1)}%를 차지하고 있어, ${
      highPriorityRate > 50
        ? "업무 부하가 높은 상황입니다. 우선순위 재조정 및 자원 배분 검토가 필요합니다."
        : highPriorityRate > 30
        ? "적정 수준의 업무 강도를 유지하고 있습니다."
        : "비교적 여유있는 업무 상황을 보이고 있습니다."
    }`;
  };

  const getDifficultyAnalysis = () => {
    const total = stats.difficulty_distribution.reduce((sum, item) => sum + item.count, 0);
    const hardTaskItems = stats.difficulty_distribution
      .filter(item => ["HARD", "VERY_HARD"].includes(item.difficulty));
    const hardTaskRate = (hardTaskItems.reduce((sum, item) => sum + item.count, 0) / total) * 100;

    return `높은 난이도(어려움/매우 어려움) 작업이 ${hardTaskRate.toFixed(1)}%를 차지하고 있어, ${
      hardTaskRate > 40
        ? "기술적 도전이 많은 상황입니다. 추가 지원이나 교육이 필요할 수 있습니다."
        : hardTaskRate > 20
        ? "적절한 수준의 기술적 도전을 유지하고 있습니다."
        : "비교적 안정적인 난이도로 업무가 구성되어 있습니다."
    }`;
  };

  const getStatusAnalysis = () => {
    const total = stats.status_distribution.reduce((sum, item) => sum + item.count, 0);
    const inProgressItems = stats.status_distribution
      .filter(item => item.status === "IN_PROGRESS");
    const inProgressRate = (inProgressItems.reduce((sum, item) => sum + item.count, 0) / total) * 100;

    return `현재 진행 중인 작업이 ${inProgressRate.toFixed(1)}%를 차지하고 있어, ${
      inProgressRate > 60
        ? "동시 진행 작업이 많아 업무 집중도가 저하될 수 있습니다."
        : inProgressRate > 30
        ? "적정한 수준의 작업을 진행하고 있습니다."
        : "추가 작업 수용이 가능한 상태입니다."
    }`;
  };

  const getImprovement = () => {
    const suggestions = [];
    const total = stats.priority_distribution.reduce((sum, item) => sum + item.count, 0);
    
    // 우선순위 비율 계산
    const highPriorityRate = (stats.priority_distribution
      .filter(item => ["HIGH", "URGENT"].includes(item.priority))
      .reduce((sum, item) => sum + item.count, 0) / total) * 100;
    
    // 난이도 비율 계산
    const hardTaskRate = (stats.difficulty_distribution
      .filter(item => ["HARD", "VERY_HARD"].includes(item.difficulty))
      .reduce((sum, item) => sum + item.count, 0) / total) * 100;

    // 진행중 작업 비율 계산
    const inProgressRate = (stats.status_distribution
      .filter(item => item.status === "IN_PROGRESS")
      .reduce((sum, item) => sum + item.count, 0) / total) * 100;

    if (highPriorityRate > 50) {
      suggestions.push(
        "우선순위 재검토 및 조정이 필요합니다.",
        "업무 분산을 위한 자원 재배치를 고려하세요."
      );
    }

    if (hardTaskRate > 40) {
      suggestions.push(
        "기술 역량 강화를 위한 교육 참여를 검토하세요.",
        "팀 내 기술 공유 세션을 활성화하세요."
      );
    }

    if (inProgressRate > 60) {
      suggestions.push(
        "진행 중인 작업의 우선순위를 재검토하세요.",
        "일부 작업의 일시 중단 또는 연기를 고려하세요."
      );
    }

    return suggestions.length > 0 ? suggestions : ["현재 작업 분포는 적절한 수준을 유지하고 있습니다."];
  };

  const getPriorityLabel = (priority: string) => {
    const labels: { [key: string]: string } = {
      "URGENT": "긴급",
      "HIGH": "높음",
      "MEDIUM": "보통",
      "LOW": "낮음"
    };
    return labels[priority] || priority;
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: { [key: string]: string } = {
      "VERY_HARD": "매우 어려움",
      "HARD": "어려움",
      "MEDIUM": "보통",
      "EASY": "쉬움"
    };
    return labels[difficulty] || difficulty;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      "TODO": "예정",
      "IN_PROGRESS": "진행중",
      "REVIEW": "검토중",
      "DONE": "료",
      "HOLD": "보류"
    };
    return labels[status] || status;
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            우선순위 분포
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.priority_distribution}
                  dataKey="count"
                  nameKey="field"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${getPriorityLabel(entry.field)} (${entry.percentage}%)`}
                >
                  {stats.priority_distribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}건`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            난이도 분포
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.difficulty_distribution}
                  dataKey="count"
                  nameKey="field"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${getDifficultyLabel(entry.field)} (${entry.percentage}%)`}
                >
                  {stats.difficulty_distribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}건`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            상태 분포
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.status_distribution}
                  dataKey="count"
                  nameKey="field"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${getStatusLabel(entry.field)} (${entry.percentage}%)`}
                >
                  {stats.status_distribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}건`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      {/* 분석 리포트 */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          {getDistributionAnalysis()}
        </Paper>
      </Grid>
    </Grid>
  );
}

// 비교 분석 컴포넌트
function ComparisonStats({ stats }: { stats: NonNullable<PersonalReport["comparison_stats"]> }) {
  // 작업이 없는 경우의 처리
  const hasTeamData = stats.team_comparison.team_avg_score > 0;
  const hasDeptData = stats.department_comparison.dept_avg_score > 0;

  // 선택된 기간에 작업이 없는 경우
  if (!hasTeamData && !hasDeptData) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              비교 분석 안내
            </Typography>
            <Typography variant="body1" paragraph>
              선택하신 기간 동안의 작업 데이터가 없어 성과 비교 분석을 제공할 수 없습니다.
            </Typography>
            <Typography variant="body1" paragraph>
              팀과 부서의 평균 성과는 다음과 같습니다:
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                팀 평균 성과
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • 평균 완료 시간: {stats.team_comparison.team_avg_completion_time}
                <br />
                • 평균 평가 점수: {stats.team_comparison.team_avg_score.toFixed(1)}/5.0
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                부서 평균 성과
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 평균 완료 시간: {stats.department_comparison.dept_avg_completion_time}
                <br />
                • 평균 평가 점수: {stats.department_comparison.dept_avg_score.toFixed(1)}/5.0
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mt: 2 }}>
              작업이 배정되고 수행되면 팀 및 부서 평균과의 상세 비교 분석이 제공됩니다.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  const getScoreComparison = (myScore: number, comparisonScore: number) => {
    if (!myScore || !comparisonScore) return "비교 데이터 없음";
    
    const difference = ((myScore - comparisonScore) / comparisonScore) * 100;
    const diffStr = Math.abs(difference).toFixed(1);
    
    if (Math.abs(difference) < 5) return "비슷한 수준";
    return difference > 0 
      ? `${diffStr}% 더 높음`
      : `${diffStr}% 더 낮음`;
  };

  const getPerformanceLevel = (score: number, avgScore: number) => {
    if (!score || !avgScore) return "평가 불가";
    
    const difference = ((score - avgScore) / avgScore) * 100;
    
    if (difference >= 15) return "상위";
    if (difference >= 5) return "중상위";
    if (difference >= -5) return "평균";
    if (difference >= -15) return "중하위";
    return "하위";
  };

  const getTeamComparisonAnalysis = () => {
    const myScore = stats.team_comparison.team_avg_score;
    const teamScore = stats.team_comparison.team_avg_score;
    const scoreComparison = getScoreComparison(myScore, teamScore);
    const performanceLevel = getPerformanceLevel(myScore, teamScore);

    return `팀 평균과 비교했을 때 평가 점수는 ${scoreComparison}이며, 
    이는 팀 내 ${performanceLevel} 수준입니다. ${
      performanceLevel === "상위" || performanceLevel === "중상위"
        ? "팀 내에서 우수한 성과를 보이고 있습니다."
        : performanceLevel === "평균"
        ? "팀 평균 수준의 안정적인 성과를 보이고 있습니다."
        : "팀 평균 수준으로의 개선 여지가 있습니다."
    }`;
  };

  const getDepartmentComparisonAnalysis = () => {
    const myScore = stats.team_comparison.team_avg_score;
    const deptScore = stats.department_comparison.dept_avg_score;
    const scoreComparison = getScoreComparison(myScore, deptScore);
    const performanceLevel = getPerformanceLevel(myScore, deptScore);

    return `부서 평균과 비교했을 때 평가 점수는 ${scoreComparison}이며, 
    이는 부서 내 ${performanceLevel} 수준입니다. ${
      performanceLevel === "상위" || performanceLevel === "중상위"
        ? "부서 내에서 우수한 성과를 보여주고 있습니다."
        : performanceLevel === "평균"
        ? "부서 평균 수준의 안정적인 성과를 보여주고 있습니다."
        : "부서 평균 수준으로의 성장 가능성이 있습니다."
    }`;
  };

  const getComparisonAnalysis = () => {
    return (
      <>
        <Typography variant="h6" gutterBottom>
          성과 비교 분석
        </Typography>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
          팀 내 성과 분석
        </Typography>
        <Typography variant="body1" paragraph>
          {getTeamComparisonAnalysis()}
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          부서 내 성과 분석
        </Typography>
        <Typography variant="body1" paragraph>
          {getDepartmentComparisonAnalysis()}
        </Typography>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
          개선 및 발전 방향
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          {getImprovementSuggestions().map((item, index) => (
            <Typography component="li" key={index} paragraph>
              {item}
            </Typography>
          ))}
        </Box>
      </>
    );
  };

  const getImprovementSuggestions = () => {
    const suggestions = [];
    
    if (!isPerformingBetterThanTeam()) {
      suggestions.push(
        "팀 내 우수 수행자와의 협업 및 노하우 공유 활성화",
        "작업 수행 프로세스 개선을 위한 팀 내 피드백 수렴"
      );
    }
    
    if (!isPerformingBetterThanDepartment()) {
      suggestions.push(
        "부서 내 교차 학습 기회 활용",
        "타 팀의 우수 사례 벤치마킹"
      );
    }
    
    if (suggestions.length === 0) {
      suggestions.push(
        "현재의 우수한 성과를 유지하기 위한 지속적인 자기 개발",
        "팀/부서 내 멘토링 활동을 통한 조직 전체 역량 향상 기여"
      );
    }
    
    return suggestions;
  };

  const isPerformingBetterThanTeam = () => {
    try {
      const myTime = parseTimeToMinutes(stats.team_comparison.team_avg_completion_time);
      const teamTime = parseTimeToMinutes(stats.team_comparison.team_avg_completion_time);
      const myScore = stats.team_comparison.team_avg_score;
      const teamScore = stats.team_comparison.team_avg_score;
      
      // 데이터가 불완전한 경우
      if (!myTime || !teamTime || !myScore || !teamScore) {
        return false;
      }
      
      // 작업 시간이 더 짧거나 같고(<=), 평가 점수가 더 높거나 같은(>=) 경우에만 true 반환
      return myTime <= teamTime && myScore >= teamScore;
    } catch (error) {
      console.error("Team performance comparison error:", error);
      return false;
    }
  };

  const isPerformingBetterThanDepartment = () => {
    try {
      const myTime = parseTimeToMinutes(stats.department_comparison.dept_avg_completion_time);
      const deptTime = parseTimeToMinutes(stats.department_comparison.dept_avg_completion_time);
      const myScore = stats.team_comparison.team_avg_score;
      const deptScore = stats.department_comparison.dept_avg_score;
      
      // 데이터가 불완전한 경우
      if (!myTime || !deptTime || !myScore || !deptScore) {
        return false;
      }
      
      // 작업 시간이 더 짧거나 같고(<=), 평가 점수가 더 높거나 같은(>=) 경우에만 true 반환
      return myTime <= deptTime && myScore >= deptScore;
    } catch (error) {
      console.error("Department performance comparison error:", error);
      return false;
    }
  };

  const parseTimeToMinutes = (timeString: string): number => {
    try {
      if (!timeString) return 0;
      
      // "2h 30m" 형식 파싱
      const hourMinuteMatch = timeString.match(/(\d+)h\s*(\d+)m/);
      if (hourMinuteMatch) {
        const hours = parseInt(hourMinuteMatch[1]);
        const minutes = parseInt(hourMinuteMatch[2]);
        return hours * 60 + minutes;
      }
      
      // "1.5h" 형식 파싱
      const hourOnlyMatch = timeString.match(/(\d+\.?\d*)h/);
      if (hourOnlyMatch) {
        const hours = parseFloat(hourOnlyMatch[1]);
        return Math.round(hours * 60);
      }
      
      // "45m" 형식 파싱
      const minuteOnlyMatch = timeString.match(/(\d+)m/);
      if (minuteOnlyMatch) {
        return parseInt(minuteOnlyMatch[1]);
      }
      
      return 0;
    } catch (error) {
      console.error("Time parsing error:", error);
      return 0;
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            팀 비교
          </Typography>
          <Box>
            <Typography variant="body2" color="text.secondary">
              팀 평균 완료 시간
            </Typography>
            <Typography variant="h6">
              {stats.team_comparison.team_avg_completion_time || "-"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              팀 평균 평가 점수
            </Typography>
            <Typography variant="h6">
              {stats.team_comparison.team_avg_score?.toFixed(1) || "-"} / 5.0
            </Typography>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            부서 비교
          </Typography>
          <Box>
            <Typography variant="body2" color="text.secondary">
              부서 평균 완료 시간
            </Typography>
            <Typography variant="h6">
              {stats.department_comparison.dept_avg_completion_time || "-"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              부서 평균 평가 점수
            </Typography>
            <Typography variant="h6">
              {stats.department_comparison.dept_avg_score?.toFixed(1) || "-"} / 5.0
            </Typography>
          </Box>
        </Paper>
      </Grid>

      {/* 분석 리포트 */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          {getComparisonAnalysis()}
        </Paper>
      </Grid>
    </Grid>
  );
}

export default withAuth(PersonalReportPage); 