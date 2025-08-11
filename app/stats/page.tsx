'use client'

import { useState, useEffect } from 'react'

export default function StatsPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [yearMonth, setYearMonth] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState('')
  const [searchMode, setSearchMode] = useState<'name' | 'phone'>('name')
  
  // 대시보드 데이터
  const [attendanceSessions, setAttendanceSessions] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [viewMode, setViewMode] = useState<'dashboard' | 'search'>('dashboard')
  const [deletingSession, setDeletingSession] = useState<string | null>(null)

  // 현재 년월과 오늘 날짜를 기본값으로 설정
  useEffect(() => {
    const now = new Date()
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const currentDate = now.toISOString().split('T')[0]
    setYearMonth(currentYearMonth)
    setSelectedDate(currentDate)
    
    // 대시보드 데이터 로드
    loadDashboardData(currentDate)
  }, [])

  const loadDashboardData = async (date: string) => {
    try {
      // 오늘 출퇴근 세션 로드
      const sessionsResponse = await fetch(`/api/attendance/list?date=${date}&limit=100`)
      const sessionsData = await sessionsResponse.json()
      
      if (sessionsData.success) {
        setAttendanceSessions(sessionsData.sessions)
      }
    } catch (error) {
      console.error('대시보드 데이터 로드 오류:', error)
    }
  }

  const handleDeleteSession = async (employeeId: string, employeeName: string) => {
    if (!confirm(`"${employeeName}"의 오늘 출퇴근 기록을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    setDeletingSession(employeeId)
    
    try {
      const response = await fetch(`/api/attendance/delete?employee_id=${employeeId}&date=${selectedDate}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 대시보드 데이터 새로고침
        await loadDashboardData(selectedDate)
        alert('출퇴근 기록이 삭제되었습니다.')
      } else {
        alert(data.message || '삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('서버 오류가 발생했습니다.')
    } finally {
      setDeletingSession(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !yearMonth) {
      setError('이름과 년월을 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')
    setStats(null)

    try {
      let employeeId = ''
      
      if (searchMode === 'name') {
        // 이름으로 직원 검색
        const employeeResponse = await fetch('/api/employees/search-by-name', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        })

        const employeeData = await employeeResponse.json()
        
        if (!employeeData.success) {
          setError('해당 이름의 직원을 찾을 수 없습니다.')
          return
        }
        
        employeeId = employeeData.employee.id
      } else {
        // 이름과 전화번호로 직원 검색
        if (!phone.trim()) {
          setError('전화번호를 입력해주세요.')
          return
        }
        
        const employeeResponse = await fetch('/api/employees/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone })
        })

        const employeeData = await employeeResponse.json()
        
        if (!employeeData.success) {
          setError('직원을 찾을 수 없습니다.')
          return
        }
        
        employeeId = employeeData.employee.id
      }

      // 통계 조회
      const statsResponse = await fetch(`/api/stats?employee_id=${employeeId}&year_month=${yearMonth}`)
      const statsData = await statsResponse.json()
      
      if (statsData.success) {
        setStats(statsData.stats)
      } else {
        setError(statsData.message || '통계 조회에 실패했습니다.')
      }
    } catch (error) {
      console.error('통계 조회 오류:', error)
      setError('서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusText = (session: any) => {
    if (session.check_in && session.check_out) {
      return '완료'
    } else if (session.check_in) {
      return '출근만'
    } else if (session.check_out) {
      return '퇴근만'
    }
    return '미완료'
  }

  const getStatusColor = (session: any) => {
    if (session.check_in && session.check_out) {
      return '#28a745' // 완료 - 초록
    } else if (session.check_in) {
      return '#ffc107' // 출근만 - 노랑
    } else if (session.check_out) {
      return '#dc3545' // 퇴근만 - 빨강
    }
    return '#6c757d' // 미완료 - 회색
  }

  // 오늘 날짜 표시용
  const todayDisplay = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  // 총 급여 계산
  const totalWage = attendanceSessions.reduce((sum, session) => {
    return sum + (session.wage || 0)
  }, 0)

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '15px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          color: '#333', 
          marginBottom: '25px',
          textAlign: 'center',
          fontSize: '20px'
        }}>
          근무 통계 대시보드
        </h1>
        
        {/* 뷰 모드 선택 */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-flex', 
            background: '#f8f9fa', 
            borderRadius: '5px', 
            padding: '2px',
            width: '100%',
            maxWidth: '300px'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('dashboard')}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                borderRadius: '3px',
                background: viewMode === 'dashboard' ? '#007bff' : 'transparent',
                color: viewMode === 'dashboard' ? 'white' : '#333',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              대시보드
            </button>
            <button
              type="button"
              onClick={() => setViewMode('search')}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                borderRadius: '3px',
                background: viewMode === 'search' ? '#007bff' : 'transparent',
                color: viewMode === 'search' ? 'white' : '#333',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              개인 통계 검색
            </button>
          </div>
        </div>

        {viewMode === 'dashboard' ? (
          // 대시보드 뷰
          <div>
            {/* 오늘 날짜 표시 */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <h2 style={{ 
                color: '#007bff', 
                marginBottom: '8px',
                fontSize: '18px'
              }}>
                📅 {todayDisplay}
              </h2>
              <p style={{ color: '#666', fontSize: '13px' }}>
                오늘의 출퇴근 현황
              </p>
            </div>

            {/* 총 급여 표시 */}
            {totalWage > 0 && (
              <div style={{ 
                marginBottom: '20px', 
                textAlign: 'center',
                padding: '12px',
                background: '#e8f5e8',
                borderRadius: '8px',
                border: '2px solid #28a745'
              }}>
                <h3 style={{ 
                  color: '#28a745', 
                  marginBottom: '5px',
                  fontSize: '16px'
                }}>
                  💰 오늘 총 급여
                </h3>
                <p style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold',
                  color: '#155724',
                  margin: 0
                }}>
                  {totalWage.toLocaleString()}원
                </p>
              </div>
            )}

            {/* 출퇴근 세션 */}
            <div>
              <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '16px' }}>출퇴근 기록</h2>
              <div style={{
                border: '1px solid #ddd',
                borderRadius: '5px',
                overflow: 'hidden',
                overflowX: 'auto'
              }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  minWidth: '600px'
                }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '13px' }}>이름</th>
                      <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: '13px' }}>출근시간</th>
                      <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: '13px' }}>퇴근시간</th>
                      <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: '13px' }}>근무시간</th>
                      <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '13px' }}>급여</th>
                      <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: '13px' }}>상태</th>
                      <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: '13px' }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceSessions.length > 0 ? (
                      attendanceSessions.map((session) => (
                        <tr key={session.employee_id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px', fontSize: '13px' }}>{session.name}</td>
                          <td style={{ padding: '10px', textAlign: 'center', fontSize: '13px' }}>
                            {session.check_in ? formatTime(session.check_in) : '-'}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center', fontSize: '13px' }}>
                            {session.check_out ? formatTime(session.check_out) : '-'}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center', fontSize: '13px' }}>
                            {session.work_hours !== null ? (
                              <span style={{ fontWeight: 'bold' }}>
                                {session.work_hours}시간 {session.work_minutes % 60}분
                              </span>
                            ) : '-'}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px' }}>
                            {session.wage ? (
                              <span style={{ 
                                fontWeight: 'bold',
                                color: '#28a745'
                              }}>
                                {session.wage.toLocaleString()}원
                              </span>
                            ) : '-'}
                          </td>
                          <td style={{ 
                            padding: '10px', 
                            textAlign: 'center',
                            color: getStatusColor(session),
                            fontWeight: 'bold',
                            fontSize: '13px'
                          }}>
                            {getStatusText(session)}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeleteSession(session.employee_id, session.name)}
                              disabled={deletingSession === session.employee_id}
                              style={{
                                padding: '4px 8px',
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                fontSize: '11px',
                                cursor: deletingSession === session.employee_id ? 'not-allowed' : 'pointer',
                                opacity: deletingSession === session.employee_id ? 0.6 : 1
                              }}
                            >
                              {deletingSession === session.employee_id ? '삭제 중...' : '삭제'}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
                          오늘의 출퇴근 기록이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          // 개인 통계 검색 뷰
          <div>
            {/* 검색 모드 선택 */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ 
                display: 'inline-flex', 
                background: '#f8f9fa', 
                borderRadius: '5px', 
                padding: '2px',
                width: '100%',
                maxWidth: '400px'
              }}>
                <button
                  type="button"
                  onClick={() => setSearchMode('name')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '3px',
                    background: searchMode === 'name' ? '#007bff' : 'transparent',
                    color: searchMode === 'name' ? 'white' : '#333',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  이름으로 검색
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode('phone')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '3px',
                    background: searchMode === 'phone' ? '#007bff' : 'transparent',
                    color: searchMode === 'phone' ? 'white' : '#333',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  이름+전화번호로 검색
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ 
                display: 'flex', 
                gap: '15px', 
                marginBottom: '20px',
                flexDirection: 'column'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    color: '#333',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}>
                    이름
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="이름을 입력하세요"
                    disabled={loading}
                  />
                </div>
                
                {searchMode === 'phone' && (
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '5px',
                      color: '#333',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}>
                      휴대폰 번호
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                      placeholder="010-1234-5678"
                      disabled={loading}
                    />
                  </div>
                )}
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    color: '#333',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}>
                    년월
                  </label>
                  <input
                    type="month"
                    value={yearMonth}
                    onChange={(e) => setYearMonth(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                    disabled={loading}
                  />
                </div>
              </div>
              
              {error && (
                <div style={{
                  padding: '10px',
                  borderRadius: '5px',
                  marginBottom: '15px',
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  border: '1px solid #f5c6cb',
                  fontSize: '13px'
                }}>
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? '조회 중...' : '통계 조회'}
              </button>
            </form>
            
            {stats && (
              <div style={{ marginTop: '25px' }}>
                <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '16px' }}>통계 결과</h2>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: '15px', 
                  marginBottom: '25px' 
                }}>
                  <div style={{
                    padding: '15px',
                    background: '#f8f9fa',
                    borderRadius: '5px',
                    textAlign: 'center'
                  }}>
                    <h3 style={{ color: '#007bff', marginBottom: '8px', fontSize: '14px' }}>총 근무일수</h3>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{stats.totalDays}일</p>
                  </div>
                  
                  <div style={{
                    padding: '15px',
                    background: '#f8f9fa',
                    borderRadius: '5px',
                    textAlign: 'center'
                  }}>
                    <h3 style={{ color: '#28a745', marginBottom: '8px', fontSize: '14px' }}>총 근무시간</h3>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{stats.totalHours}시간 {stats.totalMinutes % 60}분</p>
                  </div>
                  
                  <div style={{
                    padding: '15px',
                    background: '#f8f9fa',
                    borderRadius: '5px',
                    textAlign: 'center',
                    gridColumn: 'span 2'
                  }}>
                    <h3 style={{ color: '#dc3545', marginBottom: '8px', fontSize: '14px' }}>총 급여</h3>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{stats.totalWage.toLocaleString()}원</p>
                  </div>
                </div>
                
                {stats.dailyStats.length > 0 && (
                  <div>
                    <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '14px' }}>일별 상세</h3>
                    <div style={{
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      overflow: 'hidden',
                      overflowX: 'auto'
                    }}>
                      <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        minWidth: '400px'
                      }}>
                        <thead>
                          <tr style={{ background: '#f8f9fa' }}>
                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '13px' }}>날짜</th>
                            <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: '13px' }}>근무시간</th>
                            <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '13px' }}>급여</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.dailyStats.map((day: any, index: number) => (
                            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '10px', fontSize: '13px' }}>{day.date}</td>
                              <td style={{ padding: '10px', textAlign: 'center', fontSize: '13px' }}>
                                {day.hours}시간 {day.minutes}분
                              </td>
                              <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px' }}>
                                {day.wage.toLocaleString()}원
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <div style={{ 
          marginTop: '25px', 
          textAlign: 'center' 
        }}>
          <a href="/" style={{
            color: '#007bff',
            textDecoration: 'none',
            fontSize: '13px'
          }}>
            ← 메인으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  )
}
