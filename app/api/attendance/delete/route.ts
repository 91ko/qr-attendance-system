import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employee_id')
    const date = searchParams.get('date') // YYYY-MM-DD 형식

    if (!employeeId || !date) {
      return NextResponse.json({
        success: false,
        message: '직원 ID와 날짜가 필요합니다.'
      }, { status: 400 })
    }

    // 해당 날짜의 출퇴근 로그 삭제
    const { error: logsError } = await supabase
      .from('attendance_logs')
      .delete()
      .eq('employee_id', employeeId)
      .eq('ymd', date)

    if (logsError) {
      console.error('출퇴근 로그 삭제 오류:', logsError)
      return NextResponse.json({
        success: false,
        message: '출퇴근 로그 삭제에 실패했습니다.'
      }, { status: 500 })
    }

    // 해당 날짜의 근무 세션 삭제
    const { error: sessionError } = await supabase
      .from('work_sessions')
      .delete()
      .eq('employee_id', employeeId)
      .eq('ymd', date)

    if (sessionError) {
      console.error('근무 세션 삭제 오류:', sessionError)
      return NextResponse.json({
        success: false,
        message: '근무 세션 삭제에 실패했습니다.'
      }, { status: 500 })
    }

    // 통계 테이블 업데이트 (해당 월의 통계 재계산)
    const yearMonth = date.substring(0, 7) // YYYY-MM 형식
    
    // 해당 월의 모든 근무 세션 조회
    const { data: sessions } = await supabase
      .from('work_sessions')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('ymd', `${yearMonth}-01`)
      .lt('ymd', `${yearMonth}-32`)

    if (sessions && sessions.length > 0) {
      // 통계 재계산
      const totalDays = sessions.length
      const totalMinutes = sessions.reduce((sum, session) => sum + session.minutes, 0)
      const totalHours = Math.floor(totalMinutes / 60)
      const totalWage = sessions.reduce((sum, session) => sum + session.wage, 0)

      // 통계 업데이트
      await supabase
        .from('employee_stats')
        .upsert({
          employee_id: employeeId,
          year_month: yearMonth,
          total_days: totalDays,
          total_hours: totalHours,
          total_minutes: totalMinutes,
          total_wage: totalWage,
          updated_at: new Date().toISOString()
        }, { onConflict: 'employee_id,year_month' })
    } else {
      // 해당 월에 근무 기록이 없으면 통계 삭제
      await supabase
        .from('employee_stats')
        .delete()
        .eq('employee_id', employeeId)
        .eq('year_month', yearMonth)
    }

    return NextResponse.json({
      success: true,
      message: '출퇴근 기록이 삭제되었습니다.'
    })
  } catch (error) {
    console.error('Delete attendance API 오류:', error)
    return NextResponse.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
