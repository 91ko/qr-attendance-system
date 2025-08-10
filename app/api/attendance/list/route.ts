import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // YYYY-MM-DD 형식
    const limit = parseInt(searchParams.get('limit') || '50')
    
    if (!date) {
      return NextResponse.json({ 
        success: false, 
        message: '날짜가 필요합니다.' 
      }, { status: 400 })
    }
    
    // 해당 날짜의 출퇴근 로그 조회
    const { data: logs, error: logsError } = await supabase
      .from('attendance_logs')
      .select(`
        *,
        employees (
          name,
          phone
        )
      `)
      .eq('ymd', date)
      .order('ts', { ascending: true })
      .limit(limit)
    
    if (logsError) {
      console.error('출퇴근 기록 조회 오류:', logsError)
      return NextResponse.json({ 
        success: false, 
        message: '출퇴근 기록 조회에 실패했습니다.' 
      }, { status: 500 })
    }
    
    // 출퇴근 세션별로 그룹화
    const sessions: any[] = []
    const employeeSessions: { [key: string]: any } = {}
    
    logs?.forEach((log) => {
      const employeeId = log.employee_id
      const employeeName = log.employees?.name || 'Unknown'
      const employeePhone = log.employees?.phone || ''
      
      if (!employeeSessions[employeeId]) {
        employeeSessions[employeeId] = {
          employee_id: employeeId,
          name: employeeName,
          phone: employeePhone,
          check_in: null,
          check_out: null,
          work_hours: null,
          work_minutes: null,
          wage: null
        }
      }
      
      if (log.action === 'IN') {
        employeeSessions[employeeId].check_in = log.ts
      } else if (log.action === 'OUT') {
        employeeSessions[employeeId].check_out = log.ts
        
        // 근무 시간 계산
        if (employeeSessions[employeeId].check_in) {
          const checkInTime = new Date(employeeSessions[employeeId].check_in)
          const checkOutTime = new Date(log.ts)
          const minutes = Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60))
          const hours = minutes / 60
          
          // 시간 반올림: 30분 이상이면 올림, 30분 미만이면 내림
          const workedHours = Math.round(hours)
          
          // 급여 계산: 일한 시간 + 1만원
          const wage = (workedHours * 10000) + 10000
          
          employeeSessions[employeeId].work_hours = workedHours
          employeeSessions[employeeId].work_minutes = minutes
          employeeSessions[employeeId].wage = wage
        }
      }
    })
    
    // 완성된 세션들을 배열로 변환
    Object.values(employeeSessions).forEach((session: any) => {
      if (session.check_in || session.check_out) {
        sessions.push(session)
      }
    })
    
    // 출근 시간순으로 정렬
    sessions.sort((a, b) => {
      if (!a.check_in && !b.check_in) return 0
      if (!a.check_in) return 1
      if (!b.check_in) return -1
      return new Date(a.check_in).getTime() - new Date(b.check_in).getTime()
    })
    
    return NextResponse.json({ 
      success: true, 
      sessions: sessions || []
    })
  } catch (error) {
    console.error('Attendance list API 오류:', error)
    return NextResponse.json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}
