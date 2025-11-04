# 프로젝트 관리 시스템 - API 문서

이 문서는 프로젝트 관리 시스템의 REST API 사용 방법을 설명합니다.

## 목차

1. [개요](#개요)
2. [인증](#인증)
3. [공통 응답 형식](#공통-응답-형식)
4. [프로젝트 API](#프로젝트-api)
5. [태스크 API](#태스크-api)
6. [Enabler API](#enabler-api)
7. [에러 코드](#에러-코드)

---

## 개요

### Base URL

```
http://localhost:8000
```

### API 버전

```
/api/v1
```

### 자동 생성 API 문서

FastAPI는 자동으로 대화형 API 문서를 생성합니다:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

### Content-Type

모든 요청과 응답은 JSON 형식을 사용합니다:

```
Content-Type: application/json
```

---

## 인증

**현재 버전 (v1.0)에서는 인증이 구현되지 않았습니다.**

향후 버전에서는 JWT 기반 인증이 추가될 예정입니다.

---

## 공통 응답 형식

### 성공 응답

HTTP 상태 코드와 함께 JSON 데이터를 반환합니다:

```json
{
  "id": 1,
  "name": "프로젝트 이름",
  ...
}
```

### 에러 응답

HTTP 4xx 또는 5xx 상태 코드와 함께 에러 세부사항을 반환합니다:

```json
{
  "detail": "프로젝트 ID 123을 찾을 수 없습니다."
}
```

---

## 프로젝트 API

### 프로젝트 목록 조회

모든 프로젝트 목록을 조회합니다.

**Endpoint**
```
GET /api/v1/projects
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| skip | integer | ❌ | 0 | 건너뛸 레코드 수 (0-10000) |
| limit | integer | ❌ | 100 | 최대 조회 레코드 수 (1-1000) |

**응답 예시** (200 OK)

```json
[
  {
    "id": 1,
    "name": "웹사이트 리뉴얼",
    "description": "회사 홈페이지 전면 개편",
    "start_date": "2025-01-01T00:00:00",
    "end_date": "2025-12-31T23:59:59",
    "status": "in_progress",
    "created_at": "2025-01-01T09:00:00",
    "updated_at": "2025-01-01T09:00:00"
  }
]
```

**cURL 예시**
```bash
curl -X GET "http://localhost:8000/api/v1/projects?skip=0&limit=10"
```

---

### 프로젝트 생성

새로운 프로젝트를 생성합니다.

**Endpoint**
```
POST /api/v1/projects
```

**Request Body**

```json
{
  "name": "프로젝트 이름",
  "description": "프로젝트 설명",
  "start_date": "2025-01-01T00:00:00",
  "end_date": "2025-12-31T23:59:59",
  "status": "planning"
}
```

**필드 설명**

| 필드 | 타입 | 필수 | 제약사항 | 설명 |
|------|------|------|----------|------|
| name | string | ✅ | 1-200자 | 프로젝트 이름 |
| description | string | ❌ | 최대 2000자 | 프로젝트 설명 |
| start_date | datetime | ✅ | ISO 8601 형식 | 시작일 |
| end_date | datetime | ✅ | ISO 8601 형식 | 종료일 |
| status | string | ❌ | planning, in_progress, on_hold, completed, cancelled | 기본값: "planning" |

**응답 예시** (201 Created)

```json
{
  "id": 1,
  "name": "프로젝트 이름",
  "description": "프로젝트 설명",
  "start_date": "2025-01-01T00:00:00",
  "end_date": "2025-12-31T23:59:59",
  "status": "planning",
  "created_at": "2025-01-01T09:00:00",
  "updated_at": "2025-01-01T09:00:00"
}
```

**cURL 예시**
```bash
curl -X POST "http://localhost:8000/api/v1/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트 프로젝트",
    "description": "API 테스트용 프로젝트",
    "start_date": "2025-01-01T00:00:00",
    "end_date": "2025-12-31T23:59:59",
    "status": "planning"
  }'
```

---

### 프로젝트 상세 조회

특정 프로젝트의 상세 정보를 조회합니다.

**Endpoint**
```
GET /api/v1/projects/{project_id}
```

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| project_id | integer | 프로젝트 ID |

**응답 예시** (200 OK)

```json
{
  "id": 1,
  "name": "웹사이트 리뉴얼",
  "description": "회사 홈페이지 전면 개편",
  "start_date": "2025-01-01T00:00:00",
  "end_date": "2025-12-31T23:59:59",
  "status": "in_progress",
  "created_at": "2025-01-01T09:00:00",
  "updated_at": "2025-01-01T09:00:00"
}
```

**에러 예시** (404 Not Found)

```json
{
  "detail": "프로젝트 ID 999를 찾을 수 없습니다."
}
```

---

### 프로젝트 수정

특정 프로젝트의 정보를 수정합니다.

**Endpoint**
```
PUT /api/v1/projects/{project_id}
```

**Request Body** (모든 필드 선택사항)

```json
{
  "name": "수정된 프로젝트 이름",
  "status": "in_progress"
}
```

**응답 예시** (200 OK)

```json
{
  "id": 1,
  "name": "수정된 프로젝트 이름",
  "description": "회사 홈페이지 전면 개편",
  "start_date": "2025-01-01T00:00:00",
  "end_date": "2025-12-31T23:59:59",
  "status": "in_progress",
  "created_at": "2025-01-01T09:00:00",
  "updated_at": "2025-01-02T10:30:00"
}
```

---

### 프로젝트 삭제

특정 프로젝트를 삭제합니다.

**Endpoint**
```
DELETE /api/v1/projects/{project_id}
```

**응답** (204 No Content)

성공 시 응답 본문 없음

**에러 예시** (400 Bad Request)

```json
{
  "detail": "프로젝트 삭제에 실패했습니다. 연관된 데이터가 있는지 확인해주세요."
}
```

---

## 태스크 API

### 프로젝트의 태스크 목록 조회

특정 프로젝트의 모든 태스크를 조회합니다.

**Endpoint**
```
GET /api/v1/projects/{project_id}/tasks
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| skip | integer | ❌ | 0 | 건너뛸 레코드 수 (0-10000) |
| limit | integer | ❌ | 100 | 최대 조회 레코드 수 (1-1000) |

**응답 예시** (200 OK)

```json
[
  {
    "id": 1,
    "project_id": 1,
    "name": "요구사항 분석",
    "description": "사용자 요구사항 수집 및 분석",
    "start_date": "2025-01-01T00:00:00",
    "end_date": "2025-01-15T23:59:59",
    "duration_days": 15,
    "progress": 50.0,
    "status": "in_progress",
    "priority": "high",
    "assignee": "홍길동",
    "is_milestone": true,
    "color": "#FF5733",
    "created_at": "2025-01-01T09:00:00",
    "updated_at": "2025-01-08T14:30:00"
  }
]
```

---

### 태스크 생성

특정 프로젝트에 새로운 태스크를 생성합니다.

**Endpoint**
```
POST /api/v1/projects/{project_id}/tasks
```

**Request Body**

```json
{
  "project_id": 1,
  "name": "요구사항 분석",
  "description": "사용자 요구사항 수집 및 분석",
  "start_date": "2025-01-01T00:00:00",
  "end_date": "2025-01-15T23:59:59",
  "duration_days": 15,
  "progress": 0.0,
  "status": "not_started",
  "priority": "high",
  "assignee": "홍길동",
  "is_milestone": true,
  "color": "#FF5733"
}
```

**필드 설명**

| 필드 | 타입 | 필수 | 제약사항 | 설명 |
|------|------|------|----------|------|
| project_id | integer | ✅ | URL과 일치 | 프로젝트 ID |
| name | string | ✅ | 1-200자 | 태스크 이름 |
| description | string | ❌ | 최대 2000자 | 태스크 설명 |
| start_date | datetime | ✅ | ISO 8601 형식 | 시작일 |
| end_date | datetime | ✅ | ISO 8601 형식 | 종료일 |
| duration_days | integer | ❌ | 1-3650 | 기본값: 1 |
| progress | float | ❌ | 0.0-100.0 | 기본값: 0.0 |
| status | string | ❌ | not_started, in_progress, completed, blocked | 기본값: "not_started" |
| priority | string | ❌ | low, medium, high, critical | 기본값: "medium" |
| assignee | string | ❌ | 최대 100자 | 담당자 |
| is_milestone | boolean | ❌ | true/false | 기본값: false |
| color | string | ❌ | HEX 형식 (#RRGGBB) | 간트 차트 색상 |

**응답 예시** (201 Created)

```json
{
  "id": 1,
  "project_id": 1,
  "name": "요구사항 분석",
  ...
}
```

---

### 태스크 상세 조회

**Endpoint**
```
GET /api/v1/tasks/{task_id}
```

### 태스크 수정

**Endpoint**
```
PUT /api/v1/tasks/{task_id}
```

### 태스크 삭제

**Endpoint**
```
DELETE /api/v1/tasks/{task_id}
```

> 태스크 API의 상세 조회, 수정, 삭제는 프로젝트 API와 동일한 패턴을 따릅니다.

---

## Enabler API

Enabler API는 태스크 API와 유사한 구조를 가집니다.

### 주요 엔드포인트

- `GET /api/v1/projects/{project_id}/enablers` - Enabler 목록 조회
- `POST /api/v1/projects/{project_id}/enablers` - Enabler 생성
- `GET /api/v1/enablers/{enabler_id}` - Enabler 상세 조회
- `PUT /api/v1/enablers/{enabler_id}` - Enabler 수정
- `DELETE /api/v1/enablers/{enabler_id}` - Enabler 삭제

---

## 에러 코드

### HTTP 상태 코드

| 코드 | 의미 | 설명 |
|------|------|------|
| 200 | OK | 요청 성공 |
| 201 | Created | 리소스 생성 성공 |
| 204 | No Content | 요청 성공, 응답 본문 없음 |
| 400 | Bad Request | 잘못된 요청 (검증 실패) |
| 404 | Not Found | 리소스를 찾을 수 없음 |
| 422 | Unprocessable Entity | 요청 본문 검증 실패 |
| 500 | Internal Server Error | 서버 내부 오류 |

### 일반적인 에러 메시지

#### 404 Not Found
```json
{
  "detail": "프로젝트 ID 999를 찾을 수 없습니다."
}
```

#### 400 Bad Request (검증 실패)
```json
{
  "detail": "URL의 프로젝트 ID (1)와 요청 데이터의 프로젝트 ID (2)가 일치하지 않습니다."
}
```

#### 422 Unprocessable Entity (Pydantic 검증 실패)
```json
{
  "detail": [
    {
      "loc": ["body", "name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## 사용 예시

### Python (requests)

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# 프로젝트 생성
response = requests.post(
    f"{BASE_URL}/projects",
    json={
        "name": "테스트 프로젝트",
        "description": "API 테스트",
        "start_date": "2025-01-01T00:00:00",
        "end_date": "2025-12-31T23:59:59",
        "status": "planning"
    }
)
project = response.json()
print(f"생성된 프로젝트 ID: {project['id']}")

# 프로젝트 목록 조회
response = requests.get(f"{BASE_URL}/projects")
projects = response.json()
print(f"총 {len(projects)}개 프로젝트")
```

### JavaScript (fetch)

```javascript
const BASE_URL = "http://localhost:8000/api/v1";

// 프로젝트 생성
const response = await fetch(`${BASE_URL}/projects`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "테스트 프로젝트",
    description: "API 테스트",
    start_date: "2025-01-01T00:00:00",
    end_date: "2025-12-31T23:59:59",
    status: "planning"
  })
});

const project = await response.json();
console.log(`생성된 프로젝트 ID: ${project.id}`);
```

---

## 추가 참고 자료

- [Swagger UI](http://localhost:8000/docs) - 대화형 API 테스트
- [설치 가이드](installation-guide.md) - 서버 설치 및 실행
- [개발 가이드](development-guide.md) - API 개발 방법
- [아키텍처 문서](architecture.md) - 시스템 구조

---

**이 API 문서는 v1.0 기준이며, 향후 버전에서 변경될 수 있습니다.**
