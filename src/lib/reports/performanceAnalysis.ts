interface PerformanceMetrics {
  title: string;
  description: string;
  implications: string[];
  recommendations: string[];
}

interface PerformanceAnalysis {
  completion: {
    excellent: PerformanceMetrics;
    good: PerformanceMetrics;
    needsImprovement: PerformanceMetrics;
    poor: PerformanceMetrics;
  };
  delay: {
    none: PerformanceMetrics;
    low: PerformanceMetrics;
    moderate: PerformanceMetrics;
    high: PerformanceMetrics;
    critical: PerformanceMetrics;
  };
  quality: {
    exceptional: PerformanceMetrics;
    satisfactory: PerformanceMetrics;
    belowStandard: PerformanceMetrics;
    critical: PerformanceMetrics;
  };
  executive: {
    overall: {
      title: string;
      metrics: string[];
      analysis: string[];
    };
    trends: {
      title: string;
      positiveIndicators: string[];
      negativeIndicators: string[];
      actionItems: string[];
    };
    strategicPlanning: {
      title: string;
      shortTerm: {
        title: string;
        items: string[];
      };
      midTerm: {
        title: string;
        items: string[];
      };
      longTerm: {
        title: string;
        items: string[];
      };
    };
    riskManagement: {
      title: string;
      operationalRisks: {
        title: string;
        items: string[];
      };
      strategicRisks: {
        title: string;
        items: string[];
      };
      mitigationStrategies: {
        title: string;
        items: string[];
      };
    };
  };
}

export const performanceAnalysis: PerformanceAnalysis = {
  completion: {
    excellent: {
      title: "탁월한 업무 완수율",
      description: "90% 이상의 우수한 업무 완료율을 보여주고 있습니다.",
      implications: [
        "체계적인 업무 관리 능력 보유",
        "높은 업무 집중도와 생산성",
        "효율적인 시간 관리 역량"
      ],
      recommendations: [
        "현재의 업무 수행 방식 문서화 및 표준화",
        "타 팀원들과의 노하우 공유",
        "더 높은 난이도의 프로젝트 도전 고려"
      ]
    },
    good: {
      title: "양호한 업무 완수율",
      description: "70~90%의 안정적인 업무 완료율을 유지하고 있습니다.",
      implications: [
        "안정적인 업무 처리 능력",
        "적절한 업무 우선순위 설정",
        "일관된 성과 창출"
      ],
      recommendations: [
        "완료율 향상을 위한 미세 조",
        "업무 프로세스 효율화 검토",
        "시간 관리 전략 보완"
      ]
    },
    needsImprovement: {
      title: "개선 필요 상태",
      description: "50~70%의 완료율로 개선의 여지가 있습니다.",
      implications: [
        "업무 처리 효율성 저하",
        "프로세스상의 병목 가능성",
        "업무 부하 관리의 어려움"
      ],
      recommendations: [
        "업무 처리 프로세스 재검토",
        "우선순위 설정 방식 개선",
        "필요 시 교육 훈련 참여"
      ]
    },
    poor: {
      title: "저조한 완료율",
      description: "50% 미만의 완료율로 즉각적인 개선이 필요합니다.",
      implications: [
        "심각한 업무 지연 위험",
        "전반적인 생산성 저하",
        "조직 목표 달성 차질"
      ],
      recommendations: [
        "업무 수행 체계 전면 재검토",
        "긴급 개선 계획 수립 및 실행",
        "멘토링 또는 교육 지원 요청"
      ]
    }
  },
  delay: {
    none: {
      title: "지연 없음",
      description: "모든 작업이 일정 내에 완료되고 있습니다.",
      implications: [
        "체계적인 일정 관리 능력 보유",
        "효적인 업무 처리 프로세스 구축",
        "리스크 관리 능력 우수"
      ],
      recommendations: [
        "현행 일정 관리 체계의 문서화 및 표준화",
        "성공적인 일정 관리 노하우 공유",
        "더 복잡한 프로젝트 수행 고려"
      ]
    },
    low: {
      title: "경미한 지연",
      description: "10% 미만의 경미한 일정 지연이 발생하고 있습니다.",
      implications: [
        "대체로 안정적인 일정 관리",
        "일부 예측하지 못한 변수 발생",
        "즉각적인 대응으로 빠른 정상화 가능"
      ],
      recommendations: [
        "지연 원인에 대한 사전 예방책 수립",
        "일정 버퍼 관리 전략 재검토",
        "리스크 조기 경보 체계 보완"
      ]
    },
    moderate: {
      title: "중간 수준 지연",
      description: "10~20%의 일정 지연이 발생하여 주의가 필요한 상황입니다.",
      implications: [
        "일정 관리 체계 개선 필요",
        "업무 프로세스상의 비효율 존재",
        "자원 배분의 최적화 필요"
      ],
      recommendations: [
        "주간 단위 일정 점검 체계 강화",
        "업무 우선순위 재조정",
        "팀 내 협 방식 개선",
        "일정 관리 도구 활용도 제고"
      ]
    },
    high: {
      title: "심각한 지연",
      description: "20~30%의 상당한 일정 지연이 발생하고 있습니다.",
      implications: [
        "프로젝트 전반의 지연 위험",
        "팀 생산성 저하",
        "고객/이해관계자 신뢰도 하락 우려"
      ],
      recommendations: [
        "일일 단위 진척도 점검 체계 도입",
        "지연 작업 정상화를 위한 특별 관리",
        "필요시 외부 자원 지원 요청",
        "의사결정 프로세스 간소화"
      ]
    },
    critical: {
      title: "위기 수준 지연",
      description: "30% 이상의 심각한 일정 지연으로 즉각적 조치가 필요합니다.",
      implications: [
        "프로젝트 실패 위험 증가",
        "조직 전반의 성과 저하",
        "긴급 개선 조치 필요"
      ],
      recommendations: [
        "태스크포스팀 구성 및 운영",
        "전체 일정 재수립 및 우선순위 전면 조정",
        "임시 인력 지원 및 자원 재배치",
        "이해관계자 커뮤니케이션 강화",
        "근본 원인 분석 및 개선 계획 수립"
      ]
    }
  },
  quality: {
    exceptional: {
      title: "탁월한 업무 품질",
      description: "평균 4.5점 이상의 탁월한 업무 품질을 보여주고 있습니다.",
      implications: [
        "높은 수준의 전문성과 기술력 보유",
        "철저한 품질 관리 프로세스 운영",
        "지속적인 자기 개발 및 개선 노력",
        "조직 내 롤모델로서의 역할 수행"
      ],
      recommendations: [
        "현재의 품질 관리 방식 표준화 및 문서화",
        "품질 관리 노하우 전파 및 멘토링 수행",
        "더 높은 난이도의 프로젝트 주도",
        "조직의 품질 기준 수립에 참여",
        "혁신적인 업무 방식 제안 및 도입"
      ]
    },
    satisfactory: {
      title: "양호한 업무 품질",
      description: "평균 3.5~4.5점의 안정적인 업무 품질을 유지하고 있습니다.",
      implications: [
        "업무 요구사항에 대한 정확한 이해",
        "기본적인 품질 기준 준수",
        "안정적인 업무 수행 능력",
        "개선을 위한 적극적인 태도"
      ],
      recommendations: [
        "품질 향상을 위한 세부 영역 식별",
        "피드백을 통한 지속적 개선",
        "품질 관리 도구 및 기법 학습",
        "동료 리뷰 프로세스 적극 활용",
        "업무 수행 과정의 효율화 모색"
      ]
    },
    belowStandard: {
      title: "개선 필요 품질 수준",
      description: "평균 3.5점 미만으로 품질 개선이 필요한 상황입니다.",
      implications: [
        "기본적인 품질 기준 미달",
        "업무 이해도 또는 숙련도 부족",
        "품질 관리 프로세스 미흡",
        "추가 검토 및 수정 작업 빈번 발생"
      ],
      recommendations: [
        "핵심 역량 강화를 위한 교육 참여",
        "멘토링 또는 코칭 지원 요청",
        "품질 체크리스트 도입 및 활용",
        "단계별 품질 검증 절차 강화",
        "기술 및 도구 활용 능력 향상"
      ]
    },
    critical: {
      title: "긴급 개선 필요",
      description: "평균 2.5점 미만으로 즉각적인 품질 개선이 필요합니다.",
      implications: [
        "심각한 품질 문제 발생 위험",
        "고객 만족도 저하 우려",
        "팀 전체 생산성에 부정적 영향",
        "재작업으로 인한 자원 낭비"
      ],
      recommendations: [
        "긴급 품질 개선 계획 수립 및 실행",
        "기초 역량 강화를 위한 집중 교육",
        "단계별 밀착 지원 체계 구축",
        "업무 난이도 조정 검토",
        "품질 관리 프로세스 전면 재검토"
      ]
    }
  },
  executive: {
    overall: {
      title: "조직 전체 성과 분석",
      metrics: [
        "전체 업무 처리율 및 생산성 지표",
        "조직 차원의 일정 준수율",
        "품질 관리 성과 지표",
        "자원 활용 효율성",
        "조직 목표 달성도"
      ],
      analysis: [
        "조직 전반의 업무 수행 역량 평가",
        "프로젝트 관리 체계의 효과성 분석",
        "품질 관리 시스템의 적절성 검토",
        "인적 자원 운영의 효율성 평가",
        "조직 문화 및 업무 환경 영향 분석"
      ]
    },
    trends: {
      title: "조직 성과 동향 분석",
      positiveIndicators: [
        "프로젝트 완료율 지속적 향상",
        "팀 간 협업 효율성 증가",
        "품질 개선 지표 상승",
        "구성원 만족도 향상",
        "혁신적 업무 방식 도입 성과"
      ],
      negativeIndicators: [
        "특정 부서/팀의 성과 저하",
        "프로젝트 지연 빈도 증가",
        "품질 관련 이슈 발생",
        "자원 활용 효율성 감소",
        "조직 내 커뮤니케이션 문제"
      ],
      actionItems: [
        "조직 구조 및 프로세스 최적화",
        "성과 관리 체계 고도화",
        "인재 육성 프로그램 강화",
        "부서간 협업 체계 개선",
        "조직 문화 혁신 계획 수립"
      ]
    },
    strategicPlanning: {
      title: "전략적 발전 계획",
      shortTerm: {
        title: "단기 실행 과제 (1-3개월)",
        items: [
          "성과 개선이 시급한 영역 집중 관리",
          "즉각적인 프로세스 개선 실행",
          "핵심 인력 역량 강화 지원",
          "부서간 협업 장애요소 제거",
          "단기 성과 모니터링 체계 구축"
        ]
      },
      midTerm: {
        title: "중기 발전 과제 (3-6개월)",
        items: [
          "조직 구조 최적화 검토 및 실행",
          "성과 관리 시스템 고도화",
          "인재 육성 체계 재정립",
          "업무 프로세스 표준화",
          "조직 문화 개선 프로그램 도입"
        ]
      },
      longTerm: {
        title: "장기 전략 과제 (6-12개월)",
        items: [
          "조직 혁신 로드맵 수립 및 실행",
          "글로벌 경쟁력 강화 방안 도출",
          "지속가능한 성장 기반 구축",
          "차세대 리더 육성 체계 확립",
          "디지털 전환 전략 수립"
        ]
      }
    },
    riskManagement: {
      title: "리스크 관리 체계",
      operationalRisks: {
        title: "운영상 리스크",
        items: [
          "프로젝트 지연 리스크",
          "품질 관리 리스크",
          "인력 운영 리스크",
          "자원 활용 리스크",
          "프로세스 효율성 리스크"
        ]
      },
      strategicRisks: {
        title: "전략적 리스크",
        items: [
          "조직 경쟁력 약화 리스크",
          "인재 유출 리스크",
          "기술 역량 격차 리스크",
          "조직 문화 침체 리스크",
          "변화 관리 실패 리스크"
        ]
      },
      mitigationStrategies: {
        title: "리스크 대응 전략",
        items: [
          "선제적 모니터링 체계 구축",
          "리스크 조기 경보 시스템 운영",
          "대응 매뉴얼 수립 및 교육",
          "비상 대응 체계 정비",
          "정기적 리스크 평가 실시"
        ]
      }
    }
  }
} 