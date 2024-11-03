// 타입 정의
interface RecommendationSection {
  title: string;
  items: string[];
}

interface NoTasksSection {
  title: string;
  overview: string;
  situations: string[];
  recommendations: {
    skillDevelopment: RecommendationSection;
    processImprovement: RecommendationSection;
  };
}

interface RiskLevel {
  title: string;
  description: string;
  actions: string[];
}

interface ExecutiveSection {
  noTasks: {
    title: string;
    overview: string;
    checkPoints: string[];
  };
  riskLevels: {
    high: RiskLevel;
    medium: RiskLevel;
  };
}

interface PerformanceSection {
  title: string;
  description: string;
  suggestions: string[];
}

interface AnalysisText {
  noTasks: NoTasksSection;
  executive: ExecutiveSection;
  performance: {
    excellent: PerformanceSection;
    needsImprovement: PerformanceSection;
  };
}

export const analysisText: AnalysisText = {
  noTasks: {
    title: "현재 상태",
    overview: "현재 배정된 작업이 없는 상태입니다. 이는 다음과 같은 상황일 수 있습니다:",
    situations: [
      "신규 프로젝트 착수 준비 단계",
      "이전 작업들의 완료 후 과도기적 시점",
      "작업 배정 프로세스 상의 검토 필요 시점"
    ],
    recommendations: {
      skillDevelopment: {
        title: "역량 개발 기회",
        items: [
          "업무 관련 교육 및 훈련 참여",
          "새로운 기술 및 도구 학습",
          "자격증 취득 준비"
        ]
      },
      processImprovement: {
        title: "업무 프로세스 개선",
        items: [
          "기존 업무 수행 방식 분석 및 개선점 도출",
          "업무 매뉴얼 및 가이드라인 정비",
          "업무 자동화 방안 연구"
        ]
      }
    }
  },
  
  executive: {
    noTasks: {
      title: "조직 운영 현황",
      overview: "현재 조직 내 배정된 작업이 없습니다. 이는 다음과 같은 관점에서 검토가 필요합니다:",
      checkPoints: [
        "프로젝트 계획 및 작업 배분 프로세스 점검",
        "조직 자원 활용도 분석",
        "신규 프로젝트 발굴 및 기회 탐색"
      ]
    },
    
    riskLevels: {
      high: {
        title: "고위험",
        description: "즉각적인 조치가 필요한 상황",
        actions: [
          "긴급 태스크포스 구성",
          "일일 모니터링 체계 수립",
          "자원 재배치 검토"
        ]
      },
      medium: {
        title: "중간 위험",
        description: "주의 깊은 관리가 필요한 상황",
        actions: [
          "주간 단위 모니터링",
          "예방적 조치 시행",
          "리스크 관리 계획 수립"
        ]
      }
    }
  },
  
  performance: {
    excellent: {
      title: "탁월한 성과",
      description: "매우 우수한 업무 처리 능력을 보여주고 있습니다.",
      suggestions: [
        "현재의 업무 프로세스 표준화",
        "우수 사례 전파 및 공유",
        "추가적인 도전 과제 발굴"
      ]
    },
    needsImprovement: {
      title: "개선 필요",
      description: "업무 처리 효율성 개선이 필요한 상황입니다.",
      suggestions: [
        "업무 프로세스 재검토",
        "교육 훈련 참여",
        "멘토링 시스템 활용"
      ]
    }
  }
};

export const getAnalysisText = <K extends keyof AnalysisText>(
  category: K,
  subCategory: keyof AnalysisText[K]
): AnalysisText[K][keyof AnalysisText[K]] | null => {
  return analysisText[category]?.[subCategory] || null;
}; 