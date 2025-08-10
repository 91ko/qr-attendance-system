import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    
    if (!name) {
      return NextResponse.json({ 
        success: false, 
        message: '이름이 필요합니다.' 
      }, { status: 400 })
    }
    
    // 이름으로 직원 검색 (첫 번째 매칭되는 직원)
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('name', name)
      .limit(1)
      .single()
    
    if (employeeError || !employee) {
      return NextResponse.json({ 
        success: false, 
        message: '해당 이름의 직원을 찾을 수 없습니다.' 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      employee 
    })
  } catch (error) {
    console.error('Employee search by name API 오류:', error)
    return NextResponse.json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}
