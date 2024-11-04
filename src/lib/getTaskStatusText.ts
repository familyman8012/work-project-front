export const getTaskStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    TODO: "예정",
    IN_PROGRESS: "진행중",
    REVIEW: "검토중",
    DONE: "완료",
    HOLD: "보류",
  };
  return statusMap[status] || status;
};

export const getTaskPriorityText = (priority: string) => {
  const priorityMap: { [key: string]: string } = {
    LOW: "낮음",
    MEDIUM: "보통",
    HIGH: "높음",
    URGENT: "긴급",
  };
  return priorityMap[priority] || priority;
};

export const getTaskDifficultyText = (difficulty: string) => {
  const difficultyMap: { [key: string]: string } = {
    EASY: "난이도: 쉬움",
    MEDIUM: "난이도: 보통",
    HARD: "난이도: 어려움",
    VERY_HARD: "난이도: 매우 어려움",
  };
  return difficultyMap[difficulty] || difficulty;
};
