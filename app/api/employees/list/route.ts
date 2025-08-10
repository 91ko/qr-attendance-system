import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // 모든 직원 조회
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .order('name', { ascending: true })
    
    if (employeesError) {
      console.error('직원 목록 조회 오류:', employeesError)
      return NextResponse.json({ 
        success: false, 
        message: '직원 목록 조회에 실패했습니다.' 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      employees: employees || []
    })
  } catch (error) {
    console.error('Employees list API 오류:', error)
    return NextResponse.json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}
