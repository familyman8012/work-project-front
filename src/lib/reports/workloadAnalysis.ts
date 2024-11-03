interface WorkloadSection {
  title: string;
  description: string;
  recommendations: string[];
}

interface WorkloadAnalysis {
  overloaded: WorkloadSection;
  high: WorkloadSection;
  moderate: WorkloadSection;
  low: WorkloadSection;
  executive: {
    resourceUtilization: {
      high: {
        title: string;
        description: string;
        actions: string[];
      };
      optimal: {
        title: string;
        description: string;
        actions: string[];
      };
      low: {
        title: string;
        description: string;
        actions: string[];
      };
    };
    teamBalance: {
      title: string;
      checkPoints: string[];
      improvements: string[];
    };
  };
}

export const workloadAnalysis: WorkloadAnalysis = {
  overloaded: {
    title: "과다 업무 상태",
    description: "현재 업무량이 적정 수준을 크게 초과하여 즉각적인 조치가 필요한 상황입니다.",
    recommendations: [
      "긴급성과 중요도에 따른 작업 우선순위 전면 재조정",
      "팀 내 업무 재배분 또는 추가 인력 지원 요청",
      "불필요한 회의나 부가 업무 최소화",
      "핵심 업무 집중을 위한 업무 환경 개선",
      "스트레스 관리 및 업무 효율성 향상 방안 모색"
    ]
  },
  
  high: {
    title: "높은 업무 부하",
    description: "업무량이 다소 높은 수준으로, 체계적인 관리가 필요한 상황입니다.",
    recommendations: [
      "작업 간 우선순위 명확화 및 일정 조정",
      "업무 시간 관리 효율화 방안 수립",
      "주기적인 진행상황 점검 체계 구축",
      "업무 위임 가능성 검토",
      "업무 프로세스 최적화"
    ]
  },

  moderate: {
    title: "적정 업무 수준",
    description: "현재 적정한 수준의 업무량을 유지하고 있습니다.",
    recommendations: [
      "현재의 업무 관리 체계 유지 및 보완",
      "추가 작업 수용 가능성 검토",
      "업무 품질 향상에 집중",
      "팀 내 지식 공유 활동 강화",
      "자기 개발 시간 확보"
    ]
  },

  low: {
    title: "여유 업무 상태",
    description: "현재 업무량에 여유가 있어 추가적인 가치 창출이 가능한 상황입니다.",
    recommendations: [
      "신규 프로젝트 참여 기회 모색",
      "역량 개발 활동 강화",
      "업무 프로세스 개선 활동 수행",
      "동료 지원 및 멘토링 활동 참여",
      "조직 전체 업무 효율화에 기여"
    ]
  },

  executive: {
    resourceUtilization: {
      high: {
        title: "자원 과다 사용",
        description: "조직 전반의 업무 부하가 높은 수준입니다.",
        actions: [
          "인력 운영 계획 재검토 및 조정",
          "프로젝트 우선순위 재조정",
          "외부 자원 활용 검토",
          "업무 프로세스 효율화",
          "조직 구조 최적화 검토"
        ]
      },
      optimal: {
        title: "최적 자원 활용",
        description: "조직 자원이 효율적으로 활용되고 있습니다.",
        actions: [
          "현행 운영 체계 표준화",
          "성과 관리 체계 고도화",
          "조직 역량 강화 프로그램 운영",
          "혁신 활동 지원",
          "우수 사례 전파"
        ]
      },
      low: {
        title: "자원 활용 부족",
        description: "조직 자원의 활용도가 낮은 상황입니다.",
        actions: [
          "신규 사업 기회 발굴",
          "조직 역량 다각화",
          "인력 재배치 검토",
          "교육 훈련 강화",
          "업무 영역 확대 방안 모색"
        ]
      }
    },
    teamBalance: {
      title: "팀 간 업무 균형",
      checkPoints: [
        "팀별 업무 부하 현황",
        "인력 구성의 적정성",
        "업무 분배의 형평성",
        "전문성 분포 현황",
        "협업 체계 효율성"
      ],
      improvements: [
        "팀 간 업무 조정 체계 구축",
        "인력 교류 프로그램 운영",
        "통합 리소스 풀 운영",
        "팀 간 커뮤니케이션 강화",
        "균형적 성과 관리 체계 수립"
      ]
    }
  }
};

export const getWorkloadAnalysis = (
  taskCount: number,
  isExecutive: boolean = false
): WorkloadSection | null => {
  if (isExecutive) {
    // 본부장/이사용 분석 반환
    return null; // 추후 구현
  }

  if (taskCount > 8) {
    return workloadAnalysis.overloaded;
  } else if (taskCount > 5) {
    return workloadAnalysis.high;
  } else if (taskCount > 2) {
    return workloadAnalysis.moderate;
  } else {
    return workloadAnalysis.low;
  }
}; 