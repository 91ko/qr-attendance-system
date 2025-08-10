import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/token'
import { getKSTDateString, isCheckInTime, isCheckOutTime } from '@/lib/tz'

export async function POST(request: NextRequest) {
  try {
    const { action, token } = await request.json()
    
    if (!action || !token) {
      return NextResponse.json({ 
        success: false, 
        message: 'action과 token이 필요합니다.' 
      }, { status: 400 })
    }
    
    if (!['in', 'out'].includes(action)) {
      return NextResponse.json({ 
        success: false, 
        message: '잘못된 action입니다.' 
      }, { status: 400 })
    }
    
    const today = getKSTDateString()
    
    // 토큰 검증
    if (!verifyToken(action, token, today)) {
      return NextResponse.json({ 
        success: false, 
        message: '유효하지 않은 토큰입니다.' 
      }, { status: 400 })
    }
    
    // 시간창 검증
    if (action === 'in' && !isCheckInTime()) {
      return NextResponse.json({ 
        success: false, 
        message: '출근 시간이 아닙니다. (06:00~11:00)' 
      }, { status: 400 })
    }
    
    if (action === 'out' && !isCheckOutTime()) {
      return NextResponse.json({ 
        success: false, 
        message: '퇴근 시간이 아닙니다. (15:00~23:00)' 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '검증이 완료되었습니다.' 
    })
  } catch (error) {
    console.error('Verify API 오류:', error)
    return NextResponse.json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}
