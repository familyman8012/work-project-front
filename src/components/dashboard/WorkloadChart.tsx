import { Box, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { WorkloadStats } from "@/types/dashboard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function WorkloadChart() {
  const { data: workloadData } = useQuery<WorkloadStats[]>({
    queryKey: ["workloadStats"],
    queryFn: async () => {
      const response = await client.get("/api/tasks/workload-stats/");
      return response.data;
    }
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        작업 현황 추이
      </Typography>
      <Box sx={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={workloadData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#22c55e" 
              name="완료"
            />
            <Line 
              type="monotone" 
              dataKey="inProgress" 
              stroke="#3b82f6" 
              name="진행중"
            />
            <Line 
              type="monotone" 
              dataKey="delayed" 
              stroke="#ef4444" 
              name="지연"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
} 