## 📑 **목차**

1. [Quick Start - 서버 구동 가이드](#quick-start---서버-구동-가이드)
   - [환경 변수 설정 (.env 파일)](#환경-변수-설정-env-파일)
   - [Docker 실행 가이드](#docker-실행-가이드)
2. [서버 구동 가이드](#서버-구동-가이드)
3. [ERD 다이어그램](#erd-다이어그램)
4. [API Swagger 문서화](#api-swagger-문서화)
5. [디렉토리 구조](#디렉토리-구조)
6. [Git Issue를 활용한 Task 관리](#git-issue를-활용한-task-관리)

<br>

# 👑 Aletheia API

금 거래 및 판매를 위한 주문 관리 서비스입니다.

#### 프로젝트 구조

1. **자원 서버(api)** - 구매, 판매 주문 관리 (주문 CRUD를 위한 RESTful API)

   - 구매 및 판매 주문 생성, 조회, 수정, 삭제 기능을 담당합니다.
   - JWT 인증을 사용하여 로그인된 사용자만 주문 기능을 이용할 수 있도록 설정되었습니다.

2. **인증 서버(auth)** - 인증 서비스 (gRPC를 통한 인증 처리)
   - gRPC를 통해 자원 서버와 통신하며, JWT 액세스 토큰을 검증하고 인증된 사용자라면 사용자 정보를 반환합니다.
   - 회원가입, 로그인, Access Token과 Refresh Token 발급, 로그아웃 기능을 구현하였습니다.

#### 📅 개발 기간

24.09.04 ~ 24.09.11

#### 🛠️ 개발 환경

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![gRPC](https://img.shields.io/badge/gRPC-009688?style=for-the-badge&logo=grpc&logoColor=white) ![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

---

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

#### **BaseEntity**

Libs에 정의하여, 공통적으로 사용되는 필드 (id, createdAt, updatedAt, deletedAt)를 포함하는 엔티티입니다. 각 테이블에서 이를 상속받아 중복을 줄이고 관리의 편의성을 높였습니다.

#### **인증 서버 (Auth)**:

    •  users 테이블은 사용자 정보를 관리하며, username, password, hashed refreshToken, role 필드를 포함합니다.
    •  회원 가입을 하면 기본적으로 ‘USER` 역할이 부여됩니다.

    USER (기본 역할):
    •  회원 가입 시 자동으로 부여됩니다.
    •  본인의 주문 생성, 조회, 수정, 취소가 가능합니다.
    •  주문 상태 변경은 제한적으로 가능합니다 (예: 주문 완료 상태로만 변경).
    ADMIN (관리자 역할):
    •  모든 사용자의 주문을 조회하고 관리할 수 있습니다.
    •  주문의 상태를 모든 단계로 변경할 수 있는 권한이 있습니다.

#### **자원 서버 (API)**:

    •  products 테이블은 금의 종류(GOLD_999, GOLD_9999) 및 구매/판매 가격을 관리합니다.
    •  invoices 테이블은 각 주문 정보를 저장하며, 주문 유형(PURCHASE, SALE) 및 상태(ORDER_COMPLETED, PAYMENT_RECEIVED 등)를 기록합니다.
    •  invoices는 products와 관계를 맺고 있으며, 사용자의 ID는 JWT 토큰을 통해 전달되어 각 주문에 연결됩니다.

---

## API Swagger 문서화

각 API 서버의 Swagger 문서를 통해 API 명세를 확인할 수 있습니다. 다음 링크를 통해 Swagger UI에 접근할 수 있습니다.

- [인증 서버 Swagger 문서](http://localhost:8888/api-docs) (http://localhost:8888/api-docs)
- [API 서버 Swagger 문서](http://localhost:9999/api-docs) (http://localhost:9999/api-docs)

Swagger UI를 통해 API 요청을 테스트하고, 각 엔드포인트의 상세 정보를 확인할 수 있습니다. 
<br>
![swagger](/docs/authswagger.png)
![swagger](/docs/apiswagger.png)

<details>
  <summary>🔍 API 명세서</summary>
  
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

---

### 디렉토리 구조

<details>
  <summary>🔍 디렉토리 구조</summary>

```
├── apps
│   ├── api
│   │   ├── src
│   │   │   ├── common
│   │   │   │   └── pagination-response.interface.ts
│   │   │   ├── dto
│   │   │   │   ├── create-order.dto.ts
│   │   │   │   ├── get-orders.dto.ts
│   │   │   │   └── update-status.dto.ts
│   │   │   ├── entities
│   │   │   │   ├── invoice.entity.ts
│   │   │   │   └── product.entity.ts
│   │   │   ├── guards
│   │   │   │   └── grpc-auth.guard.ts
│   │   │   ├── main.ts
│   │   │   ├── order.controller.spec.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── order.module.ts
│   │   │   ├── order.service.ts
│   │   │   └── proto
│   │   │       └── auth.proto
│   │   ├── test
│   │   │   ├── app.e2e-spec.ts
│   │   │   └── jest-e2e.json
│   │   └── tsconfig.app.json
│   └── auth
│       ├── src
│       │   ├── auth-grpc.controller.ts
│       │   ├── auth.controller.spec.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.module.ts
│       │   ├── auth.service.ts
│       │   ├── dto
│       │   │   ├── login.dto.ts
│       │   │   └── register.dto.ts
│       │   ├── entities
│       │   │   └── user.entity.ts
│       │   ├── guards
│       │   │   ├── jwt-auth.guard.ts
│       │   │   └── jwt-refresh.guard.ts
│       │   ├── main.ts
│       │   ├── proto
│       │   │   └── auth.proto
│       │   └── strategies
│       │       ├── jwt-auth.strategy.ts
│       │       ├── jwt-refresh.strategy.ts
│       │       └── jwt.types.ts
│       ├── test
│       │   ├── app.e2e-spec.ts
│       │   └── jest-e2e.json
│       └── tsconfig.app.json
├── db-init
│   ├── api-init.sh
│   └── auth-init.sh
├── docker-compose.yml
├── libs
│   └── shared
│       ├── src
│       │   ├── database
│       │   │   ├── base.entity.ts
│       │   │   └── database.module.ts
│       │   ├── filters
│       │   │   └── global-exception.filter.ts
│       │   ├── index.ts
│       │   ├── logger
│       │   │   └── logger.module.ts
│       │   ├── shared.module.ts
│       │   ├── shared.service.spec.ts
│       │   └── shared.service.ts
│       └── tsconfig.lib.json
├── nest-cli.json
├── package-lock.json
├── package.json
└── tsconfig.json
```

</details>

---

### Git Issue를 활용한 Task 관리

<details>
  <summary>🔍 Git Issue 관리</summary>

![Issue](/docs/Issue.png)

</details>



