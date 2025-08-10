import { NextRequest, NextResponse } from 'next/server'
import { generateQRUrl } from '@/lib/token'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') as 'in' | 'out'
    
    if (!action || !['in', 'out'].includes(action)) {
      return NextResponse.json({ 
        success: false, 
        message: '잘못된 action 파라미터입니다.' 
      }, { status: 400 })
    }
    
    // 환경변수 체크
    if (!process.env.SECRET) {
      return NextResponse.json({ 
        success: false, 
        message: '서버 설정이 완료되지 않았습니다. 관리자에게 문의하세요.' 
      }, { status: 500 })
    }
    
    const url = generateQRUrl(action)
    
    return NextResponse.json({ 
      success: true, 
      url 
    })
  } catch (error) {
    console.error('Today API 오류:', error)
    return NextResponse.json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}
