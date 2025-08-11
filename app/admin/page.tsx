'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'

export default function AdminPage() {
  const [checkInQR, setCheckInQR] = useState<string>('')
  const [checkOutQR, setCheckOutQR] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsAuthenticated(true)
        sessionStorage.setItem('adminAuthenticated', 'true')
      } else {
        setAuthError(data.message || '인증에 실패했습니다.')
      }
    } catch (error) {
      console.error('인증 오류:', error)
      setAuthError('서버 오류가 발생했습니다.')
    } finally {
      setAuthLoading(false)
    }
  }

  useEffect(() => {
    const authenticated = sessionStorage.getItem('adminAuthenticated') === 'true'
    setIsAuthenticated(authenticated)
  }, [])

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword('')
    setAuthError('')
    sessionStorage.removeItem('adminAuthenticated')
    setCheckInQR('')
    setCheckOutQR('')
  }

  const generateQR = async (action: 'in' | 'out') => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/today?action=${action}`)
      const data = await response.json()

      if (data.success) {
        const qrDataURL = await QRCode.toDataURL(data.url)
        if (action === 'in') {
          setCheckInQR(qrDataURL)
        } else {
          setCheckOutQR(qrDataURL)
        }
      } else {
        setError(data.message || 'QR 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('QR 생성 오류:', error)
      setError('QR 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 인증되지 않은 경우 로그인 화면 표시
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f5f5f5',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h1 style={{
            color: '#333',
            marginBottom: '30px',
            textAlign: 'center',
            fontSize: '24px'
          }}>
            🔐 관리자 인증
          </h1>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                관리자 비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="비밀번호를 입력하세요"
                required
                disabled={authLoading}
              />
            </div>

            {authError && (
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                border: '1px solid #f5c6cb',
                fontSize: '14px'
              }}>
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              style={{
                width: '100%',
                padding: '15px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: authLoading ? 'not-allowed' : 'pointer',
                marginBottom: '15px',
                opacity: authLoading ? 0.6 : 1
              }}
            >
              {authLoading ? '인증 중...' : '로그인'}
            </button>
          </form>

          <div style={{
            textAlign: 'center'
          }}>
            <a href="/" style={{
              color: '#007bff',
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              ← 메인으로 돌아가기
            </a>
          </div>
        </div>
      </div>
    )
  }

  // 인증된 경우 관리자 페이지 표시
  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <h1 style={{
            color: '#333',
            margin: 0,
            fontSize: '24px'
          }}>
            관리자 페이지
          </h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            로그아웃
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '20px',
          flexDirection: 'column'
        }}>
          <button
            onClick={() => generateQR('in')}
            disabled={loading}
            style={{
              padding: '15px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              width: '100%'
            }}
          >
            출근 QR 생성
          </button>

          <button
            onClick={() => generateQR('out')}
            disabled={loading}
            style={{
              padding: '15px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              width: '100%'
            }}
          >
            퇴근 QR 생성
          </button>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '20px',
          flexDirection: 'column'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ 
              marginBottom: '15px', 
              color: '#007bff',
              fontSize: '18px'
            }}>출근 QR</h3>
            {checkInQR ? (
              <img
                src={checkInQR}
                alt="출근 QR"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  border: '2px solid #007bff',
                  borderRadius: '8px'
                }}
              />
            ) : (
              <div style={{
                width: '250px',
                height: '250px',
                border: '2px dashed #ccc',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                color: '#999',
                fontSize: '14px'
              }}>
                QR 코드가 없습니다
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{ 
              marginBottom: '15px', 
              color: '#dc3545',
              fontSize: '18px'
            }}>퇴근 QR</h3>
            {checkOutQR ? (
              <img
                src={checkOutQR}
                alt="퇴근 QR"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  border: '2px solid #dc3545',
                  borderRadius: '8px'
                }}
              />
            ) : (
              <div style={{
                width: '250px',
                height: '250px',
                border: '2px dashed #ccc',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                color: '#999',
                fontSize: '14px'
              }}>
                QR 코드가 없습니다
              </div>
            )}
          </div>
        </div>

        <div style={{
          marginTop: '30px',
          textAlign: 'center'
        }}>
          <a href="/" style={{
            color: '#007bff',
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            ← 메인으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  )
}
