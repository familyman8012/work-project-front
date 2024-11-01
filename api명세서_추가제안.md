## 추가 제안 API 엔드포인트

### 인증

- `/api/auth/logout/` (POST): 토큰 무효화
- `/api/auth/me/` (GET): 현재 로그인한 사용자 정보 조회

### 작업

- `/api/tasks/statistics/` (GET): 작업 통계 조회
  - 기간별, 사용자별, 부서별 통계
  - 완료율, 평균 소요시간 등

### 사용자

- `/api/users/{id}/tasks/statistics/` (GET): 특정 사용자의 작업 통계
- `/api/users/{id}/tasks/history/` (GET): 특정 사용자의 작업 이력

### 알림

- `/api/notifications/count/` (GET): 읽지 않은 알림 개수 조회
- `/api/notifications/read-all/` (POST): 모든 알림 읽음 처리
