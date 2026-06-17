# 🚛 배차지시서 통합 관리 시스템 (TAEWOONG Dispatch)

생산 현장의 배차 업무를 디지털화하는 풀스택 웹 애플리케이션입니다.

## 📋 기능
- 배차지시서 작성 / 수정 / 삭제 / 조회
- 엑셀(.xlsx) 다운로드 (단건 / 날짜별 시트 분리 목록)
- PDF 출력 및 인쇄
- 변경 이력 영구 저장
- 역할 기반 접근 제어 (관리자 / 담당자 / 기사)
- JWT 인증 (Access / Refresh Token)

## 🛠 기술 스택
- **프론트엔드**: React 18 + TypeScript + Vite + Tailwind CSS
- **백엔드**: NestJS + TypeScript + Prisma ORM
- **데이터베이스**: PostgreSQL 16
- **인프라**: Docker Compose

## 📦 사전 요구사항
- Node.js 20+
- pnpm 8+ (`npm install -g pnpm`)
- Docker Desktop

## 🚀 빠른 시작

### 1. 환경 설정
```bash
cp .env.example .env
# .env 파일을 열어서 JWT_SECRET, POSTGRES_PASSWORD 등을 변경하세요
```

## Local Development Notes
- The web app uses `/api` as its default API path, so `VITE_API_BASE_URL` is optional.
- In `npm run dev`, Vite proxies `/api` to the local backend on `http://127.0.0.1:5123`.
- If the proxy is not available, the client automatically falls back to local backend addresses such as `127.0.0.1:5123` and `localhost:3000`.
- You can still set `VITE_API_BASE_URL` in `.env` if you want to point the frontend at a different backend.
- Dispatch creation saves to the server and then navigates to the detail page on success.
- The dispatch list page supports Excel export for the current filter, a date range, or a month.

### 2. Docker로 데이터베이스 실행
```bash
docker compose up -d postgres
```

### 3. 의존성 설치
```bash
# 루트에서
cd apps/api && pnpm install
cd ../web && pnpm install
```

### 4. 데이터베이스 마이그레이션 및 시드
```bash
cd apps/api
pnpm prisma migrate dev --name init
pnpm prisma db seed
```

### 5. 개발 서버 실행
```bash
# 터미널 1 - 백엔드
cd apps/api
pnpm run start:dev

# 터미널 2 - 프론트엔드
cd apps/web
pnpm run dev
```

### 6. 접속
- 프론트엔드: http://localhost:5173
- API 서버: http://localhost:3000
- Swagger API 문서: http://localhost:3000/api/docs

## 🔑 기본 로그인 계정

| 역할 | 로그인 ID | 비밀번호 | 권한 |
|------|----------|---------|------|
| 관리자 | admin | Admin1234! | 전체 권한 |
| 담당자 | dispatcher1 | Disp1234! | 배차지시서 CRUD + 엑셀 |
| 담당자 | dispatcher2 | Disp1234! | 배차지시서 CRUD + 엑셀 |

## ⚙️ .env 주요 설정

| 변수 | 설명 | 예시 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 연결 URL | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | JWT 액세스 토큰 서명 키 (32자 이상) | `your_secret_key` |
| `JWT_REFRESH_SECRET` | JWT 리프레시 토큰 서명 키 | `your_refresh_secret` |
| `JWT_EXPIRES_IN` | 액세스 토큰 만료 시간 | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | 리프레시 토큰 만료 시간 | `7d` |
| `API_PORT` | 백엔드 서버 포트 | `3000` |
| `WEB_PORT` | 프론트엔드 개발 서버 포트 | `5173` |
| `VITE_API_BASE_URL` | 프론트에서 API 호출 기본 URL | `http://localhost:3000` |

## 📁 프로젝트 구조
```
TAEWOONG Dispatch/
├── docker-compose.yml
├── .env.example
├── README.md
└── apps/
    ├── web/                    # React + Vite 프론트엔드
    │   ├── src/
    │   │   ├── main.tsx
    │   │   ├── App.tsx
    │   │   ├── routes/         # 라우터 설정
    │   │   ├── pages/          # 페이지 컴포넌트
    │   │   ├── components/     # 공통 컴포넌트
    │   │   ├── features/       # 기능별 모듈 (auth, dispatch)
    │   │   └── lib/            # API 클라이언트, 유틸
    │   └── package.json
    └── api/                    # NestJS 백엔드
        ├── src/
        │   ├── main.ts
        │   ├── app.module.ts
        │   └── modules/
        │       ├── auth/       # JWT 인증
        │       ├── users/      # 사용자 관리
        │       ├── dispatch/   # 배차지시서 CRUD
        │       └── export/     # 엑셀 내보내기
        ├── prisma/
        │   ├── schema.prisma   # DB 스키마
        │   └── seed.ts         # 시드 데이터
        └── package.json
```

## 🐳 Docker로 전체 실행 (선택)
```bash
docker compose up -d
```
