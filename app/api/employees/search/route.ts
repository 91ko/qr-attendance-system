import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { name, phone } = await request.json()
    
    if (!name || !phone) {
      return NextResponse.json({ 
        success: false, 
        message: '이름과 휴대폰 번호가 필요합니다.' 
      }, { status: 400 })
    }
    
    // 직원 검색
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('name', name)
      .eq('phone', phone)
      .single()
    
    if (employeeError || !employee) {
      return NextResponse.json({ 
        success: false, 
        message: '직원을 찾을 수 없습니다.' 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      employee 
    })
  } catch (error) {
    console.error('Employee search API 오류:', error)
    return NextResponse.json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}
