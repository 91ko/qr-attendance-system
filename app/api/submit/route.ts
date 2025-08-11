import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getKSTDateString, getKSTTimeString } from '@/lib/tz'
import { verifyToken } from '@/lib/token'

export async function POST(request: NextRequest) {
  try {
    const { action, token, name, phone } = await request.json()

    if (!action || !token || !name || !phone) {
      return NextResponse.json({
        success: false,
        message: '모든 필드가 필요합니다.'
      }, { status: 400 })
    }

    if (!['in', 'out'].includes(action)) {
      return NextResponse.json({
        success: false,
        message: '잘못된 action입니다.'
      }, { status: 400 })
    }

    const today = getKSTDateString()
    const now = getKSTTimeString()

    // 토큰 재검증
    if (!verifyToken(action, token, today)) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      }, { status: 400 })
    }

    // IP 주소와 User Agent 가져오기
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    const ua = request.headers.get('user-agent') || 'unknown'

    // 1. 직원 정보 upsert
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .upsert(
        { name, phone, hourly_wage: 20000 }, // 기본 시급을 2만원으로 변경
        { onConflict: 'name,phone' }
      )
      .select()
      .single()

    if (employeeError) {
      console.error('직원 정보 저장 오류:', employeeError)
      return NextResponse.json({
        success: false,
        message: '직원 정보 저장에 실패했습니다.'
      }, { status: 500 })
    }

    // 2. 출퇴근 로그 기록
    const { error: logError } = await supabase
      .from('attendance_logs')
      .insert({
        employee_id: employee.id,
        action: action.toUpperCase() as 'IN' | 'OUT',
        ts: now,
        ymd: today,
        ip,
        ua
      })

    if (logError) {
      console.error('출퇴근 로그 저장 오류:', logError)
      return NextResponse.json({
        success: false,
        message: '출퇴근 로그 저장에 실패했습니다.'
      }, { status: 500 })
    }

    let message = action === 'in' ? '출근이 완료되었습니다.' : '퇴근이 완료되었습니다.'

    // 3. 퇴근인 경우 근무 세션 생성 및 통계 업데이트
    if (action === 'out') {
      // 오늘 출근 로그 찾기
      const { data: checkInLog, error: checkInError } = await supabase
        .from('attendance_logs')
        .select('ts')
        .eq('employee_id', employee.id)
        .eq('action', 'IN')
        .eq('ymd', today)
        .single()

      if (checkInLog && !checkInError) {
        // 근무 시간 계산 (분 단위)
        const checkInTime = new Date(checkInLog.ts)
        const checkOutTime = new Date(now)
        const minutes = Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60))
        const hours = minutes / 60

        // 시간 반올림: 30분 이상이면 올림, 30분 미만이면 내림
        const workedHours = Math.round(hours)
        const wage = (workedHours * 10000) + 10000 // 시간당 1만원 + 기본 1만원

        // 근무 세션 저장
        const { error: sessionError } = await supabase
          .from('work_sessions')
          .insert({
            employee_id: employee.id,
            in_ts: checkInLog.ts,
            out_ts: now,
            minutes,
            wage,
            ymd: today
          })

        if (!sessionError) {
          // 4. 통계 테이블 업데이트
          const yearMonth = today.substring(0, 7) // YYYY-MM 형식

          // 기존 통계 조회
          const { data: existingStats } = await supabase
            .from('employee_stats')
            .select('*')
            .eq('employee_id', employee.id)
            .eq('year_month', yearMonth)
            .single()

          if (existingStats) {
            // 기존 통계 업데이트
            await supabase
              .from('employee_stats')
              .update({
                total_days: existingStats.total_days + 1,
                total_hours: existingStats.total_hours + workedHours,
                total_minutes: existingStats.total_minutes + minutes,
                total_wage: existingStats.total_wage + wage,
                updated_at: now
              })
              .eq('id', existingStats.id)
          } else {
            // 새 통계 생성
            await supabase
              .from('employee_stats')
              .insert({
                employee_id: employee.id,
                year_month: yearMonth,
                total_days: 1,
                total_hours: workedHours,
                total_minutes: minutes,
                total_wage: wage
              })
          }

          // 사용자에게는 근무 시간만 표시 (급여 정보 숨김)
          message = `퇴근이 완료되었습니다.\n근무 시간: ${Math.floor(hours)}시간 ${minutes % 60}분 (${workedHours}시간으로 계산)`
        }
      }
    }

    return NextResponse.json({
      success: true,
      message
    })
  } catch (error) {
    console.error('Submit API 오류:', error)
    return NextResponse.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
