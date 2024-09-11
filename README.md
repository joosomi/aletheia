# Aletheia 금 거래 및 판매 서비스

## Quick Start - 서버 구동 가이드

### 환경 변수 설정 (.env 파일)

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고, 다음과 같은 환경 변수를 설정하세요:

```bash
# API Database
API_DB_HOST=
API_DB_PORT=
API_DB_NAME=
API_DB_USER=
API_DB_PASSWORD=
API_DB_ROOT_PASSWORD=

# Auth Database
AUTH_DB_HOST=
AUTH_DB_PORT=
AUTH_DB_NAME=
AUTH_DB_USER=
AUTH_DB_PASSWORD=
AUTH_DB_ROOT_PASSWORD=

# Application Ports
API_PORT=
API_GRPC_PORT=

AUTH_PORT=
AUTH_GRPC_PORT=

# Other settings
NODE_ENV=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=

JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=
```

---

### Docker 실행 가이드

프로젝트의 데이터베이스 및 필요한 서비스를 Docker로 실행하려면, 아래 단계를 따르세요.

### 1. Docker Compose 설정 확인

루트 디렉토리에 있는 `docker-compose.yml` 파일을 확인하고, `.env` 파일이 제대로 설정되었는지 확인하세요.

### 2. Docker 컨테이너 실행

아래 명령어를 사용하여 Docker 컨테이너를 백그라운드에서 실행합니다:

```bash
docker-compose up -d
```

---

## 서버 구동 가이드

### 1. 패키지 설치

Docker 컨테이너가 실행된 후, 프로젝트의 모든 의존성을 설치해야 합니다.

```bash
npm install
```

### 2. 서버 실행

개별 서버 실행

```
npm run start:api
npm run start:auth
```

두 서버 동시에 실행

```
npm run start:all
```

개발 모드 실행

```
npm run start:dev:all
```

---

## ERD 다이어그램

![ERD 다이어그램](/docs/erd.png)

---

## API Swagger 문서화

각 API 서버의 Swagger 문서를 통해 API 명세를 확인할 수 있습니다. 다음 링크를 통해 Swagger UI에 접근할 수 있습니다.

- [인증 서버 Swagger 문서](http://localhost:8888/api-docs) (http://localhost:8888/api-docs)
- [API 서버 Swagger 문서](http://localhost:9999/api-docs) (http://localhost:9999/api-docs)

Swagger UI를 통해 API 요청을 테스트하고, 각 엔드포인트의 상세 정보를 확인할 수 있습니다.

<details>
  <summary>API 명세서</summary>
  
## 1. 인증 API

### 1.1 회원가입

```
POST /auth/register
```

새로운 사용자를 등록합니다.

**요청 본문 예시:**

```json
{
  "username": "john_doe",
  "password": "strong_password_123"
}
```

**응답:**

- `204 No Content`: 회원가입 성공
- `400 Bad Request`: 잘못된 요청 (빈 값 또는 잘못된 형식)
- `409 Conflict`: 이미 존재하는 계정명

### 1.2 로그인

```
POST /auth/login
```

사용자 로그인을 처리합니다.

**요청 본문 예시:**

```json
{
  "username": "john_doe",
  "password": "strong_password_123"
}
```

**응답:**

- `200 OK`: 로그인 성공 (액세스 토큰과 리프레시 토큰 발급)
- `400 Bad Request`: 잘못된 요청 (계정명이나 비밀번호가 빈 값)
- `401 Unauthorized`: 로그인 실패 (아이디 또는 비밀번호 오류)

### 1.3 토큰 갱신

```
POST /auth/refresh
```

리프레시 토큰을 사용해 새로운 액세스 토큰을 발급받습니다.

**헤더:**

```
Authorization: Bearer {refresh_token}
```

**응답:**

- `200 OK`: 새로운 액세스 토큰 발급 성공
- `401 Unauthorized`: 리프레시 토큰이 유효하지 않거나 만료됨

### 1.4 로그아웃

```
POST /auth/logout
```

사용자 로그아웃을 처리합니다.

**헤더:**

```
Authorization: Bearer {access_token}
```

**응답:**

- `204 No Content`: 로그아웃 성공
- `401 Unauthorized`: 토큰이 유효하지 않거나 만료됨

## 2. 주문 API

### 2.1 주문 목록 조회

```
GET /orders
```

페이지네이션이 적용된 주문 목록을 조회합니다. 사용자는 본인의 주문만 조회할 수 있으며, 관리자는 모든 주문을 조회할 수 있습니다.

**쿼리 매개변수:**

- `date`: 날짜별 필터링 (YYYY-MM-DD 형식)
- `limit`: 한 페이지당 항목 수 (기본값: 10)
- `offset`: 건너뛸 항목 수 (기본값: 0)
- `orderType`: 주문 유형별 필터링 (PURCHASE: 구매, SALE: 판매)

**헤더:**

```
Authorization: Bearer {access_token}
```

**응답:**

- `200 OK`: 주문 목록 조회 성공
- `400 Bad Request`: 잘못된 입력 정보
- `401 Unauthorized`: 인증 실패

### 2.2 주문 상세 조회

```
GET /orders/{orderId}
```

주문 ID로 금 주문의 상세 정보를 조회합니다. 사용자는 본인의 주문만 조회할 수 있습니다.

**헤더:**

```
Authorization: Bearer {access_token}
```

**응답:**

- `200 OK`: 주문 상세 조회 성공
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 해당 주문에 접근할 권한이 없음
- `404 Not Found`: 해당 주문을 찾을 수 없음

### 2.3 주문 취소

```
DELETE /orders/{orderId}
```

주문을 취소합니다. 본인의 주문만 취소 가능하며, 주문 완료/입금 완료/송금 완료 상태에서만 취소가 가능합니다.

**헤더:**

```
Authorization: Bearer {access_token}
```

**응답:**

- `200 OK`: 주문 취소 성공
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 주문을 취소할 권한이 없음
- `404 Not Found`: 해당 주문을 찾을 수 없음

### 2.4 금 구매 주문 생성

```
POST /orders/purchase
```

새로운 금 구매 주문을 생성합니다.

**헤더:**

```
Authorization: Bearer {access_token}
```

**요청 본문:**

```json
{
  "productType": "GOLD_999",
  "quantity": 10.5,
  "deliveryAddress": "서울시 강남구 테헤란로 123",
  "recipientName": "홍길동",
  "contactNumber": "010-1234-5678",
  "postalCode": "12345"
}
```

**응답:**

- `201 Created`: 주문 생성 성공
- `400 Bad Request`: 잘못된 입력 정보
- `401 Unauthorized`: 인증 실패

### 2.5 금 판매 주문 생성

```
POST /orders/sale
```

새로운 금 판매 주문을 생성합니다.

**헤더:**

```
Authorization: Bearer {access_token}
```

**요청 본문:**

```json
{
  "productType": "GOLD_999",
  "quantity": 10.5,
  "deliveryAddress": "서울시 강남구 테헤란로 123",
  "recipientName": "홍길동",
  "contactNumber": "010-1234-5678",
  "postalCode": "12345"
}
```

**응답:**

- `201 Created`: 주문 생성 성공
- `400 Bad Request`: 잘못된 입력 정보
- `401 Unauthorized`: 인증 실패

### 2.6 주문 상태 변경

```
PATCH /orders/{orderId}/status
```

주문의 상태를 변경합니다. 관리자는 모든 상태로 변경이 가능하고, 일반 사용자는 주문 완료 상태로만 변경 가능합니다.

**헤더:**

```
Authorization: Bearer {access_token}
```

**요청 본문 예시:**

```json
{
  "status": "ORDER_COMPLETED"
}
```

**응답:**

- `200 OK`: 주문 상태 변경 성공
- `400 Bad Request`: 잘못된 입력 정보 또는 유효하지 않은 상태 변경
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 주문 상태를 변경할 권한이 없음
- `404 Not Found`: 해당 주문을 찾을 수 없음
</details>
