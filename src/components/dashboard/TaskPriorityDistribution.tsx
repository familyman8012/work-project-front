import { Box, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { PriorityStats } from "@/types/dashboard";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

const COLORS = {
  URGENT: '#ef4444',  // 빨간색
  HIGH: '#f97316',    // 주황색
  MEDIUM: '#eab308',  // 노란색
  LOW: '#22c55e'      // 초록색
};

export default function TaskPriorityDistribution() {
  const { data: priorityData } = useQuery<PriorityStats[]>({
    queryKey: ["taskPriorityStats"],
    queryFn: async () => {
      const response = await client.get("/api/tasks/priority-stats/");
      return response.data;
    }
  });

  const getPriorityLabel = (priority: string) => {
    const labels: { [key: string]: string } = {
      URGENT: "긴급",
      HIGH: "높음",
      MEDIUM: "보통",
      LOW: "낮음"
    };
    return labels[priority] || priority;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        우선순위 분포
      </Typography>
      <Box sx={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={priorityData}
              dataKey="count"
              nameKey="priority"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              label={({ priority, percent }) => 
                `${getPriorityLabel(priority)} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {priorityData?.map((entry: any) => (
                <Cell 
                  key={entry.priority} 
                  fill={COLORS[entry.priority as keyof typeof COLORS]} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [value, getPriorityLabel(String(name))]}
            />
            <Legend 
              formatter={(value) => getPriorityLabel(String(value))}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
} 