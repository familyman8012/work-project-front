# 📚 상세 API 명세서

python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); user = User.objects.get(username='tech_head'); user.set_password('test123!'); user.save()"

python -m venv venv

username="testuser",
email="test@example.com",
password="testpass123",

맥 :
source venv/bin/activate
윈도우 :
venv\Scripts\activate

python manage.py runserver

pip install -r requirements/base.txt

python manage.py runserver

테스트 계정 :
tech_head
backend_dev2
frontend_dev1

## 1. 인증 (Authentication)

### 1.1 로그인

- **URL**: `/api/token/`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response (200)**:
  ```json
  {
    "access": "string",
    "refresh": "string"
  }
  ```
- **Response (401)**:
  ```json
  {
    "detail": "아이디 또는 비밀번호가 올바르지 않습니다."
  }
  ```

### 1.2 토큰 갱신

- **URL**: `/api/token/refresh/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "refresh": "string"
  }
  ```
- **Response (200)**:
  ```json
  {
    "access": "string"
  }
  ```

### 1.3 현재 로그인한 사용자 정보 조회

- **URL**: `/api/users/me/`
- **Method**: `GET`
- **Headers**:
  ```
  Authorization: Bearer {access_token}
  ```
- **Response (200)**:
  ```json
  {
    "id": 0,
    "username": "string",
    "email": "string",
    "employee_id": "string",
    "role": "EMPLOYEE",
    "rank": "STAFF",
    "department": 0,
    "department_name": "string",
    "first_name": "string",
    "last_name": "string"
  }
  ```

### 1.4 로그아웃

- **URL**: `/api/auth/logout/`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer {access_token}
  ```
- **Response (200)**:
  ```json
  {
    "detail": "로그아웃되었습니다."
  }
  ```

## 2. 사용자 (Users)

### 2.1 사용자 목록 조회

- **URL**: `/api/users/`
- **Method**: `GET`
- **Headers**:
  ```
  Authorization: Bearer {access_token}
  ```
- **Query Parameters**:
  - `department`: 부서 ID (선택)
  - `role`: 역할 (EMPLOYEE/MANAGER/ADMIN) (선택)
  - `rank`: 직급 (선택)
  - `search`: 검색어 (이름, 사원번호) (선택)
- **Response (200)**:
  ```json
  {
    "count": 0,
    "next": "string(url)",
    "previous": "string(url)",
    "results": [
      {
        "id": 0,
        "username": "string",
        "email": "string",
        "employee_id": "string",
        "role": "EMPLOYEE",
        "rank": "STAFF",
        "department": 0,
        "department_name": "string",
        "organization": 0,
        "organization_name": "string"
      }
    ]
  }
  ```

### 2.2 사용자 상세 조회

- **URL**: `/api/users/{id}/`
- **Method**: `GET`
- **Response (200)**:
  ```json
  {
    "id": 0,
    "username": "string",
    "email": "string",
    "employee_id": "string",
    "role": "EMPLOYEE",
    "rank": "STAFF",
    "department": 0,
    "department_name": "string",
    "first_name": "string",
    "last_name": "string"
  }
  ```

### 2.3 사용자별 작업 통계

- **URL**: `/api/users/{id}/tasks/statistics/`
- **Method**: `GET`
- **Query Parameters**:
  - `start_date`: YYYY-MM-DD
  - `end_date`: YYYY-MM-DD
- **Response (200)**:
  ```json
  {
    "total_tasks": 0,
    "completed_tasks": 0,
    "in_progress_tasks": 0,
    "delayed_tasks": 0,
    "completion_rate": 0.0,
    "average_completion_time": "string",
    "tasks_by_priority": {
      "HIGH": 0,
      "MEDIUM": 0,
      "LOW": 0
    }
  }
  ```

### 2.4 사용자별 작업 이력

- **URL**: `/api/users/{id}/tasks/history/`
- **Method**: `GET`
- **Query Parameters**:
  - `status`: TODO/IN_PROGRESS/REVIEW/DONE/HOLD
  - `start_date`: YYYY-MM-DD
  - `end_date`: YYYY-MM-DD
- **Response (200)**:
  ```json
  {
    "count": 0,
    "next": "string(url)",
    "previous": "string(url)",
    "results": [
      {
        "id": 0,
        "title": "string",
        "status": "string",
        "start_date": "string",
        "completed_at": "string",
        "actual_hours": 0.0
      }
    ]
  }
  ```

### 2.5 현재 진행인 작업 조회

- **URL**: `/api/users/{id}/tasks/current/`
- **Method**: `GET`
- **Response (200)**:
  ```json
  {
    "count": 0,
    "results": [
      {
        "id": 0,
        "title": "string",
        "status": "IN_PROGRESS",
        "priority": "string",
        "start_date": "string",
        "due_date": "string",
        "estimated_hours": 0.0,
        "actual_hours": 0.0
      }
    ]
  }
  ```

## 3. 작업 (Tasks)

### 3.1 작업 목록 조회

- **URL**: `/api/tasks/`
- **Method**: `GET`
- **Query Parameters**:
  - `status`: TODO/IN_PROGRESS/REVIEW/DONE/HOLD
  - `priority`: LOW/MEDIUM/HIGH/URGENT
  - `assignee`: 담당자 ID
  - `department`: 부서 ID
  - `start_date_after`: YYYY-MM-DD
  - `due_date_before`: YYYY-MM-DD
  - `search`: 제목 검색
- **Response (200)**:
  ```json
  {
    "count": 0,
    "next": "string(url)",
    "previous": "string(url)",
    "results": [
      {
        "id": 0,
        "title": "string",
        "description": "string",
        "status": "TODO",
        "priority": "MEDIUM",
        "assignee": 0,
        "assignee_name": "string",
        "reporter": 0,
        "reporter_name": "string",
        "department": 0,
        "department_name": "string",
        "start_date": "2024-03-20T09:00:00Z",
        "due_date": "2024-03-25T18:00:00Z",
        "completed_at": "2024-03-25T18:00:00Z",
        "created_at": "2024-03-20T09:00:00Z",
        "updated_at": "2024-03-20T09:00:00Z",
        "estimated_hours": 8.0,
        "actual_hours": 7.5,
        "difficulty": "MEDIUM",
        "is_delayed": false
      }
    ]
  }
  ```

### 3.2 작업 생성

- **URL**: `/api/tasks/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "status": "TODO",
    "priority": "MEDIUM",
    "assignee": 0,
    "department": 0,
    "start_date": "2024-03-20T09:00:00Z",
    "due_date": "2024-03-25T18:00:00Z",
    "estimated_hours": 8.0,
    "difficulty": "MEDIUM"
  }
  ```
- **Response (201)**: 생성된 작업 정보 반환

### 3.3 작업 수정

- **URL**: `/api/tasks/{id}/`
- **Method**: `PATCH`
- **Request Body**: 수정할 필드만 포함
  ```json
  {
    "status": "IN_PROGRESS",
    "priority": "HIGH"
  }
  ```
- **Response (200)**: 수정된 작업 정보 반환

### 3.4 작업 상세 조회

- **URL**: `/api/tasks/{id}/`
- **Method**: `GET`
- **Response (200)**:
  ```json
  {
    "id": 0,
    "title": "string",
    "description": "string",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "assignee": 0,
    "assignee_name": "string",
    "reporter": 0,
    "reporter_name": "string",
    "department": 0,
    "department_name": "string",
    "start_date": "2024-03-15T09:00:00Z",
    "due_date": "2024-03-20T18:00:00Z",
    "estimated_hours": 40.0,
    "actual_hours": 35.0,
    "is_delayed": false
  }
  ```

### 3.5 작업 난이도 변경

- **URL**: `/api/tasks/{id}/update-difficulty/`
- **Method**: `PATCH`
- **Request Body**:
  ```json
  {
    "difficulty": "HARD"
  }
  ```
- **Response (200)**:
  ```json
  {
    "id": 0,
    "difficulty": "HARD",
    "title": "string",
    "status": "string"
  }
  ```

## 4. 작업 첨부파일 (Task Attachments)

### 4.1 첨부파일 목록 조회

- **URL**: `/api/task-attachments/`
- **Method**: `GET`
- **Query Parameters**:
  - `task`: 작업 ID (필수)
- **Response (200)**:
  ```json
  {
    "count": 0,
    "results": [
      {
        "id": 0,
        "task": 0,
        "file": "file_url",
        "filename": "string",
        "uploaded_by": 0,
        "uploaded_by_name": "string",
        "created_at": "timestamp"
      }
    ]
  }
  ```

### 4.2 첨부파일 업로드

- **URL**: `/api/task-attachments/`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  ```json
  {
    "task": 0,
    "file": "file",
    "filename": "string"
  }
  ```
- **Response (201)**:
  ```json
  {
    "id": 0,
    "task": 0,
    "file": "file_url",
    "filename": "string",
    "uploaded_by": 0,
    "uploaded_by_name": "string",
    "created_at": "timestamp"
  }
  ```

### 4.3 첨부파일 삭제

- **URL**: `/api/task-attachments/{id}/`
- **Method**: `DELETE`
- **Response (204)**

## 5. 작업 코멘트 (Task Comments)

### 5.1 코멘트 목록 조회

- **URL**: `/api/task-comments/`
- **Method**: `GET`
- **Query Parameters**:
  - `task`: 작업 ID (필수)
- **Response (200)**:
  ```json
  {
    "count": 0,
    "results": [
      {
        "id": 0,
        "task": 0,
        "author": 0,
        "author_name": "string",
        "content": "string",
        "created_at": "2024-03-20T09:00:00Z",
        "updated_at": "2024-03-20T09:00:00Z"
      }
    ]
  }
  ```

### 5.2 코멘트 작성

- **URL**: `/api/task-comments/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "task": 0,
    "content": "string"
  }
  ```
- **Response (201)**: 생성된 코멘트 정보 반환

## 6. 작업 히스토리 (Task History)

### 6.1 히스토리 생성

- **URL**: `/api/task-history/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "task": 0,
    "previous_status": "TODO",
    "new_status": "IN_PROGRESS",
    "comment": "작업 시작"
  }
  ```
- **Response (201)**: 생성된 히스토리 정보 반환

### 6.2 히스토리 조회

- **URL**: `/api/task-history/{id}/`
- **Method**: `GET`
- **Response (200)**:
  ```json
  {
    "id": 0,
    "task": 0,
    "changed_by": 0,
    "changed_by_name": "string",
    "previous_status": "TODO",
    "new_status": "IN_PROGRESS",
    "comment": "작업 시작",
    "created_at": "2024-03-15T09:00:00Z"
  }
  ```

## 7. 작업 시간 기록 (Task Time Logs)

### 7.1 시간 기록 시작

- **URL**: `/api/task-time-logs/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "task": 0,
    "start_time": "2024-03-15T09:00:00Z"
  }
  ```
- **Response (201)**: 생성된 시간 기록 정보 반환

### 7.2 시간 기록 종료

- **URL**: `/api/task-time-logs/{id}/`
- **Method**: `PATCH`
- **Request Body**:
  ```json
  {
    "end_time": "2024-03-15T17:00:00Z"
  }
  ```
- **Response (200)**:
  ```json
  {
    "id": 0,
    "task": 0,
    "start_time": "2024-03-15T09:00:00Z",
    "end_time": "2024-03-15T17:00:00Z",
    "duration": "08:00:00",
    "logged_by": 0,
    "logged_by_name": "string"
  }
  ```

## 8. 작업 평가 (Task Evaluations)

### 8.1 평가 생성

- **URL**: `/api/task-evaluations/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "task": 0,
    "difficulty": "MEDIUM",
    "performance_score": 4,
    "feedback": "작업을 잘 완수했습니다"
  }
  ```
- **Response (201)**: 생성된 평가 정보 반환

### 8.2 평가 조회

- **URL**: `/api/task-evaluations/{id}/`
- **Method**: `GET`
- **Response (200)**:
  ```json
  {
    "id": 0,
    "task": 0,
    "evaluator": 0,
    "evaluator_name": "string",
    "difficulty": "MEDIUM",
    "performance_score": 4,
    "feedback": "작업을 잘 완수했습니다",
    "created_at": "2024-03-15T09:00:00Z"
  }
  ```

## 9. 알림 (Notifications)

### 9.1 알림 목록 조회

- **URL**: `/api/notifications/`
- **Method**: `GET`
- **Query Parameters**:
  - `is_read`: true/false (선택)
- **Response (200)**:
  ```json
  {
    "count": 0,
    "results": [
      {
        "id": 0,
        "recipient": 0,
        "recipient_name": "string",
        "notification_type": "TASK_ASSIGNED",
        "task": 0,
        "task_title": "string",
        "message": "string",
        "is_read": false,
        "created_at": "2024-03-20T09:00:00Z"
      }
    ]
  }
  ```

### 9.2 알림 읽음 처리

- **URL**: `/api/notifications/{id}/`
- **Method**: `PATCH`
- **Request Body**:
  ```json
  {
    "is_read": true
  }
  ```
- **Response (200)**: 수정된 알림 정보 반환

### 9.3 읽지 않은 알림 개수 조회

- **URL**: `/api/notifications/unread-count/`
- **Method**: `GET`
- **Response (200)**:
  ```json
  {
    "count": 0
  }
  ```

### 9.4 모든 알림 읽음 처리

- **URL**: `/api/notifications/mark-all-read/`
- **Method**: `POST`
- **Response (200)**:
  ```json
  {
    "detail": "모든 알림이 읽음 처리되었습니다."
  }
  ```

## 10. 실시간 알림 (WebSocket 향후 구현)

### 10.1 WebSocket 연결

- **URL**: `ws://도메인/ws/notifications/`
- **Headers**:
  ```
  Authorization: Bearer {access_token}
  ```
- **수신 메시지 형식**:
  ```json
  {
    "type": "notification",
    "data": {
      "id": 0,
      "notification_type": "string",
      "message": "string",
      "task_id": 0,
      "created_at": "string"
    }
  }
  ```

## 11. 부서 (Departments)

### 11.1 부서 목록 조회

- **URL**: `/api/departments/`
- **Method**: `GET`
- **Headers**:
  ```
  Authorization: Bearer {access_token}
  ```
- **Response (200)**:
  ```json
  {
    "count": 0,
    "next": "string(url)",
    "previous": "string(url)",
    "results": [
      {
        "id": 0,
        "name": "string",
        "code": "string",
        "parent": null,
        "parent_name": "string",
        "created_at": "string",
        "updated_at": "string"
      }
    ]
  }
  ```

### 11.2 부서 생성

- **URL**: `/api/departments/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "string",
    "code": "string",
    "parent": null
  }
  ```
- **Response (201)**: 생성된 부서 정보 반환

### 11.3 부서 상세 조회

- **URL**: `/api/departments/{id}/`
- **Method**: `GET`
- **Response (200)**:
  ```json
  {
    "id": 0,
    "name": "string",
    "code": "string",
    "parent": null,
    "parent_name": "string",
    "created_at": "string",
    "updated_at": "string"
  }
  ```

### 11.4 부서 수정

- **URL**: `/api/departments/{id}/`
- **Method**: `PATCH`
- **Request Body**:
  ```json
  {
    "name": "string",
    "code": "string",
    "parent": null
  }
  ```
- **Response (200)**: 수정된 부서 정보 반환

## 12. 보고서 (Reports)

### 12.1 개인 보고서 조회

- **URL**: `/api/reports/personal-report/`
- **Method**: `GET`
- **Query Parameters**:
  - `start_date`: YYYY-MM-DD (필수)
  - `end_date`: YYYY-MM-DD (필수)
- **Response (200)**:
  ```json
  {
    "total_tasks": 0,
    "completed_tasks": 0,
    "in_progress_tasks": 0,
    "average_completion_time": "string"
  }
  ```

### 12.2 부서별 보고서 조회

- **URL**: `/api/reports/department-report/`
- **Method**: `GET`
- **Query Parameters**:
  - `department_id`: number (필수)
- **Response (200)**:
  ```json
  {
    "department_id": 0,
    "department_name": "string",
    "total_tasks": 0,
    "completed_tasks": 0,
    "in_progress_tasks": 0,
    "delayed_tasks": 0,
    "completion_rate": 0.0,
    "average_completion_time": "string",
    "tasks_by_priority": {
      "HIGH": 0,
      "MEDIUM": 0,
      "LOW": 0
    },
    "tasks_by_difficulty": {
      "EASY": 0,
      "MEDIUM": 0,
      "HARD": 0,
      "VERY_HARD": 0
    }
  }
  ```

### 12.3 성과 평가 보고서 조회

- **URL**: `/api/reports/performance-evaluation/`
- **Method**: `GET`
- **Query Parameters**:
  - `user_id`: number (필수)
- **Response (200)**:
  ```json
  {
    "user_id": 0,
    "user_name": "string",
    "evaluation_period": {
      "start_date": "2024-03-01T00:00:00Z",
      "end_date": "2024-03-31T23:59:59Z"
    },
    "task_statistics": {
      "total_tasks": 0,
      "completed_tasks": 0,
      "completion_rate": 0.0,
      "on_time_completion_rate": 0.0,
      "average_task_duration": "string"
    },
    "performance_metrics": {
      "average_performance_score": 0.0,
      "tasks_by_difficulty": {
        "EASY": 0,
        "MEDIUM": 0,
        "HARD": 0,
        "VERY_HARD": 0
      },
      "tasks_by_priority": {
        "HIGH": 0,
        "MEDIUM": 0,
        "LOW": 0
      }
    },
    "evaluations": [
      {
        "task_id": 0,
        "task_title": "string",
        "difficulty": "MEDIUM",
        "performance_score": 4,
        "feedback": "string",
        "evaluated_at": "2024-03-15T09:00:00Z"
      }
    ]
  }
  ```

## 13. 공통 사항

### 13.1 인증

- 모든 API 요청에 Authorization 헤더 필요
  ```
  Authorization: Bearer {access_token}
  ```

### 13.2 페이지네이션

- 기본 페이지 크기: 10
- 최대 페이지 크기: 100
- Query Parameters:
  - `page`: 페이지 번호
  - `page_size`: 페이지당 항목 수

### 13.3 날짜/시간 형식

- ISO 8601 형식 사용: `YYYY-MM-DDTHH:mm:ssZ`
- 모든 시간은 UTC 기준

### 13.4 에러 응답

#### 인증 오류 (401)

```json
{
  "detail": "인증 자격 증명이 제공되지 않았습니다."
}
```

#### 권한 오류 (403)

```json
{
  "detail": "이 작업을 수행할 권한이 없습니다."
}
```

#### 유효성 검사 오류 (400)

```json
{
  "field_name": ["에러 메시지"]
}
```

## 13. 일정 관리 (Schedule)

### 13.1 캘린더 뷰 작업 목록 조회

- **URL**: `/api/tasks/calendar/`
- **Method**: `GET`
- **Query Parameters**:
  - `start_date`: YYYY-MM-DD (필수)
  - `end_date`: YYYY-MM-DD (필수)
  - `view_type`: month/week/day (기본값: month)
- **Response (200)**:
  ```json
  [
    {
      "id": 0,
      "title": "string",
      "start_date": "2024-03-20T09:00:00Z",
      "due_date": "2024-03-25T18:00:00Z",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "is_milestone": false,
      "assignee": 0,
      "is_delayed": false,
      "color": "#1976d2",
      "textColor": "#ffffff",
      "progress": 75
    }
  ]
  ```

### 13.2 작업 일정 업데이트 (드래그 앤 드롭)

- **URL**: `/api/tasks/{id}/update_dates/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "start_date": "2024-03-20T09:00:00Z",
    "due_date": "2024-03-25T18:00:00Z"
  }
  ```
- **Response (200)**: 수정된 작업 정보
- **Response (400)**:
  ```json
  {
    "detail": "일정이 충돌합니다."
  }
  ```

### 13.3 리소스 할당 상황 조회

- **URL**: `/api/tasks/workload/`
- **Method**: `GET`
- **Query Parameters**:
  - `date`: YYYY-MM-DD (기본값: 오늘)
  - `department`: 부서 ID (선택)
- **Response (200)**:
  ```json
  [
    {
      "user_id": 0,
      "user_name": "string",
      "tasks_count": 0
    }
  ]
  ```

### 13.4 마일스톤 관련 필드

Task 모델에 추가된 필드들:

- `is_milestone`: boolean - 마일스톤 여부
- `milestone_description`: string - 마일스톤 설명
- `working_hours`: JSON - 일별 작업 시간 기록
- `dependencies`: array - 선행 작업 목록

### 13.5 일정 충돌 관리

- 작업 일정 변경 시 자동으로 충돌 체크
- 동일 담당자의 작업 시간 중복 방지
- 충돌 발생 시 400 에러 반환

### 13.6 작업 의존성 관리

- 선행 작업 완료 시 자동 알림 발송
- 의존성 있는 작업의 상태 변경 시 연관 작업 담당자에게 알림
- 작업 완료 시 의존성 체크 및 관련 알림 발송

### 13.7 작업 진행률 계산

- 예상 시간 대비 실제 소요 시간 기준
- 작업 상태 및 시간 기록 반영
- 진행률은 0-100% 사이 값으로 표시
