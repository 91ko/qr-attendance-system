# QR 출퇴근 관리 시스템

Next.js App Router와 TypeScript를 사용한 무료 QR 코드 기반 출퇴근 관리 웹앱입니다.

## 주요 기능

### 관리자 기능
- `/admin` 페이지에서 출근/퇴근 QR 코드 생성
- HMAC-SHA256 기반 보안 토큰 생성
- 시간대별 접근 제한 (출근: 06~11시, 퇴근: 15~23시)
- 실시간 에러 메시지 표시

### 직원 기능
- QR 코드 스캔으로 출퇴근 체크인
- 이름과 휴대폰 번호 입력 (유효성 검사 포함)
- 자동 근무시간 및 급여 계산
- 개행이 포함된 메시지 표시

## 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, React 18
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **QR Code**: qrcode 패키지
- **Security**: HMAC-SHA256 토큰 검증

## 프로젝트 구조

```
qr-attendance-system/
├── app/
│   ├── admin/
│   │   └── page.tsx          # 관리자 페이지
│   ├── api/
│   │   ├── submit/
│   │   │   └── route.ts      # 출퇴근 기록 제출 API
│   │   ├── today/
│   │   │   └── route.ts      # 오늘자 QR URL 생성 API
│   │   └── verify/
│   │       └── route.ts      # 토큰 검증 API
│   ├── checkin/
│   │   └── page.tsx          # 체크인 페이지
│   ├── layout.tsx            # 루트 레이아웃
│   └── page.tsx              # 메인 페이지
├── lib/
│   ├── supabase.ts           # Supabase 클라이언트
│   ├── token.ts              # 토큰 생성/검증 유틸
│   └── tz.ts                 # KST 시간 유틸
├── package.json
├── next.config.js
├── tsconfig.json
├── README.md
├── env.example               # 환경변수 예시
├── supabase-schema.sql       # 데이터베이스 스키마
└── .gitignore
```

## 데이터베이스 스키마

### employees 테이블
```sql
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  hourly_wage INTEGER DEFAULT 10000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, phone)
);
```

### attendance_logs 테이블
```sql
CREATE TABLE attendance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  action TEXT CHECK (action IN ('IN', 'OUT')) NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  ymd DATE NOT NULL,
  ip TEXT,
  ua TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### work_sessions 테이블
```sql
CREATE TABLE work_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  in_ts TIMESTAMPTZ NOT NULL,
  out_ts TIMESTAMPTZ NOT NULL,
  minutes INTEGER NOT NULL,
  wage INTEGER NOT NULL,
  ymd DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# 보안 토큰 생성용 비밀키 (필수)
SECRET=your-super-secret-key-here

# 애플리케이션 기본 URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase 설정 (필수)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE=your-service-role-key
```

### 3. Supabase 설정
1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase-schema.sql` 파일의 내용 실행
3. Project Settings > API에서 URL과 Service Role Key 복사

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## Vercel 배포

### 1. Vercel CLI 설치
```bash
npm i -g vercel
```

### 2. 프로젝트 배포
```bash
vercel
```

### 3. 환경변수 설정
Vercel 대시보드에서 다음 환경변수들을 설정하세요:
- `SECRET`
- `NEXT_PUBLIC_BASE_URL` (배포된 URL)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE`

## 사용 방법

### 관리자
1. `/admin` 페이지 접속
2. "출근 QR 생성" 또는 "퇴근 QR 생성" 버튼 클릭
3. 생성된 QR 코드를 직원들에게 공유
4. 에러 발생 시 화면에 메시지 표시

### 직원
1. QR 코드 스캔
2. 이름과 휴대폰 번호 입력 (형식: 010-1234-5678)
3. 제출 버튼 클릭
4. 퇴근 시 근무시간과 급여 확인

## 보안 기능

- **HMAC-SHA256 토큰 검증**: 당일만 유효한 보안 토큰
- **시간대별 접근 제한**: 출근/퇴근 시간 외 접근 차단
- **IP 및 User Agent 기록**: 출퇴근 로그에 접속 정보 저장
- **Supabase RLS**: 데이터베이스 레벨 보안
- **환경변수 검증**: 필수 설정 누락 시 명확한 에러 메시지

## 개선사항

### 최근 추가된 기능
- 휴대폰 번호 유효성 검사 (한국 휴대폰 번호 형식)
- 개행이 포함된 메시지 표시 (근무시간/급여 정보)
- 환경변수 누락 시 명확한 에러 메시지
- 관리자 페이지 에러 표시 개선
- API 에러 처리 강화

## 문제 해결

### 일반적인 문제들

1. **"SECRET environment variable is required" 오류**
   - `.env.local` 파일에 `SECRET` 변수가 설정되어 있는지 확인

2. **"SUPABASE_URL and SUPABASE_SERVICE_ROLE environment variables are required" 오류**
   - Supabase 프로젝트 설정에서 URL과 Service Role Key를 확인

3. **QR 코드 생성 실패**
   - 환경변수가 올바르게 설정되어 있는지 확인
   - 브라우저 콘솔에서 에러 메시지 확인

## 라이선스

MIT License
