import { Box, Typography, Grid, LinearProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { TeamPerformanceData } from "@/types/dashboard";

export default function TeamPerformance() {
  const { data: teamData } = useQuery<TeamPerformanceData>({
    queryKey: ["teamPerformance"],
    queryFn: async () => {
      const response = await client.get("/api/tasks/team-performance/");
      return response.data;
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'success.main';
    if (score >= 3.5) return 'primary.main';
    if (score >= 2.5) return 'warning.main';
    return 'error.main';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        팀 성과
      </Typography>
      <Grid container spacing={3}>
        {teamData?.members.map((member: any) => (
          <Grid item xs={12} key={member.user_id}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">
                  {member.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color={getScoreColor(member.average_score)}
                  fontWeight="bold"
                >
                  평균 {member.average_score.toFixed(1)}점
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={member.completion_rate} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'background.default',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                      }
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {member.completion_rate}%
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                총 {member.task_count}개 작업 중 {Math.round(member.task_count * member.completion_rate / 100)}개 완료
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 