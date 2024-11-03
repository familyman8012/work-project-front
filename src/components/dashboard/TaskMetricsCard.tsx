import { Card, Box, Typography, IconButton } from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";

interface TaskMetricsCardProps {
  title: string;
  value: number;
  trend: number;
  icon: string;
  isNegative?: boolean;
}

export default function TaskMetricsCard({
  title,
  value,
  trend,
  icon,
  isNegative
}: TaskMetricsCardProps) {
  return (
    <Card
      sx={{
        p: 3,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
        background: isNegative 
          ? 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)'
          : 'linear-gradient(135deg, #f0f7ff 0%, #fff 100%)',
        border: '1px solid',
        borderColor: isNegative ? 'error.light' : 'primary.light',
        borderRadius: 2,
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography 
          color="text.secondary" 
          variant="subtitle2" 
          sx={{ mb: 1 }}
        >
          {title}
        </Typography>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600,
            color: isNegative ? 'error.main' : 'primary.main'
          }}
        >
          {value}
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mt: 1 
          }}
        >
          <IconButton
            size="small"
            sx={{
              bgcolor: trend > 0 ? 'success.light' : 'error.light',
              color: '#fff',
              mr: 1,
              '&:hover': {
                bgcolor: trend > 0 ? 'success.main' : 'error.main',
              }
            }}
          >
            {trend > 0 ? <TrendingUp /> : <TrendingDown />}
          </IconButton>
          <Typography 
            variant="body2"
            color={trend > 0 ? 'success.main' : 'error.main'}
          >
            {Math.abs(trend)}% vs last week
          </Typography>
        </Box>
      </Box>
    </Card>
  );
} 