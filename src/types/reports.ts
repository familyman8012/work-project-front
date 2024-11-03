interface DistributionItem {
  field: string;
  count: number;
  percentage: number;
}

export interface PersonalReport {
  basic_stats: {
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    delayed_tasks: number;
    completion_rate: number;
    delay_rate: number;
    efficiency_score: number;
  };
  time_stats: {
    average_completion_time: string;
    estimated_vs_actual: number;
    daily_work_hours: Array<{
      date: string;
      hours: number;
    }>;
    peak_productivity_hours: string[];
    overtime_frequency: number;
    time_utilization_rate: number;
  };
  quality_stats: {
    average_score: number;
    review_rejection_rate: number;
    rework_rate: number;
    first_time_pass_rate: number;
    defect_density: number;
    quality_trend: Array<{
      date: string;
      score: number;
    }>;
  };
  comparison_stats: {
    team_comparison: {
      team_avg_completion_time: string;
      team_avg_score: number;
      my_completion_time: string;
      my_score: number;
      relative_efficiency: number;
    };
    department_comparison: {
      dept_avg_completion_time: string;
      dept_avg_score: number;
      my_completion_time: string;
      my_score: number;
      relative_efficiency: number;
    };
  };
  trend_analysis: {
    performance_trend: {
      completion_rate_trend: Array<{
        date: string;
        rate: number;
      }>;
      quality_score_trend: Array<{
        date: string;
        score: number;
      }>;
      efficiency_trend: Array<{
        date: string;
        score: number;
      }>;
    };
    workload_trend: {
      task_volume_trend: Array<{
        date: string;
        count: number;
      }>;
      complexity_trend: Array<{
        date: string;
        level: number;
      }>;
      overtime_trend: Array<{
        date: string;
        hours: number;
      }>;
    };
    skill_development: {
      skill_improvement_rate: number;
      learning_curve: Array<{
        date: string;
        level: number;
      }>;
      knowledge_areas: Array<{
        area: string;
        level: number;
      }>;
    };
  };
  distribution_stats: {
    priority_distribution: DistributionItem[];
    difficulty_distribution: DistributionItem[];
    status_distribution: DistributionItem[];
  };
} 