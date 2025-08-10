-- QR 출퇴근 관리 시스템 데이터베이스 스키마

-- 직원 테이블
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  hourly_wage INTEGER DEFAULT 20000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, phone)
);

-- 출퇴근 로그 테이블
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

-- 근무 세션 테이블
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

-- 통계 테이블 (월별/직원별)
CREATE TABLE employee_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL, -- YYYY-MM 형식
  total_days INTEGER DEFAULT 0,
  total_hours INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  total_wage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, year_month)
);

-- 인덱스 생성
CREATE INDEX idx_attendance_logs_employee_date ON attendance_logs(employee_id, ymd);
CREATE INDEX idx_attendance_logs_action_date ON attendance_logs(action, ymd);
CREATE INDEX idx_work_sessions_employee_date ON work_sessions(employee_id, ymd);
CREATE INDEX idx_employee_stats_employee_month ON employee_stats(employee_id, year_month);

-- RLS (Row Level Security) 설정
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_stats ENABLE ROW LEVEL SECURITY;

-- 서비스 롤을 위한 정책 (API에서 사용)
CREATE POLICY "Service role can do everything" ON employees FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do everything" ON attendance_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do everything" ON work_sessions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do everything" ON employee_stats FOR ALL USING (auth.role() = 'service_role');
