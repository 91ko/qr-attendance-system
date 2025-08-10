import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employee_id')
    const yearMonth = searchParams.get('year_month') // YYYY-MM 형식
    
    if (!employeeId) {
      return NextResponse.json({ 
        success: false, 
        message: '직원 ID가 필요합니다.' 
      }, { status: 400 })
    }
    
    // 해당 월의 근무 세션 조회
    const { data: sessions, error: sessionsError } = await supabase
      .from('work_sessions')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('ymd', `${yearMonth}-01`)
      .lt('ymd', `${yearMonth}-32`)
      .order('ymd', { ascending: true })
    
    if (sessionsError) {
      console.error('근무 세션 조회 오류:', sessionsError)
      return NextResponse.json({ 
        success: false, 
        message: '통계 조회에 실패했습니다.' 
      }, { status: 500 })
    }
    
    // 통계 계산
    const totalDays = sessions?.length || 0
    const totalMinutes = sessions?.reduce((sum, session) => sum + session.minutes, 0) || 0
    const totalHours = Math.floor(totalMinutes / 60)
    const totalWage = sessions?.reduce((sum, session) => sum + session.wage, 0) || 0
    
    // 일별 상세 정보
    const dailyStats = sessions?.map(session => ({
      date: session.ymd,
      hours: Math.floor(session.minutes / 60),
      minutes: session.minutes % 60,
      wage: session.wage
    })) || []
    
    return NextResponse.json({ 
      success: true, 
      stats: {
        totalDays,
        totalHours,
        totalMinutes,
        totalWage,
        dailyStats
      }
    })
  } catch (error) {
    console.error('Stats API 오류:', error)
    return NextResponse.json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}
