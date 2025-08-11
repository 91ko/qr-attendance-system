import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({
        success: false,
        message: '비밀번호가 필요합니다.'
      }, { status: 400 })
    }

    // 환경변수에서 관리자 비밀번호 가져오기 (기본값: admin1234)
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234'

    if (password === adminPassword) {
      return NextResponse.json({
        success: true,
        message: '인증이 완료되었습니다.'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: '잘못된 비밀번호입니다.'
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Admin auth API 오류:', error)
    return NextResponse.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
