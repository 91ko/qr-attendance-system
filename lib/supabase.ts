import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE environment variables are required');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface Employee {
  id: string;
  name: string;
  phone: string;
  hourly_wage: number;
}

export interface AttendanceLog {
  id: string;
  employee_id: string;
  action: 'IN' | 'OUT';
  ts: string;
  ymd: string;
  ip: string;
  ua: string;
}

export interface WorkSession {
  id: string;
  employee_id: string;
  in_ts: string;
  out_ts: string;
  minutes: number;
  wage: number;
  ymd: string;
}
