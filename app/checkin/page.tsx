'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function CheckinPage() {
  const searchParams = useSearchParams()
  const action = searchParams.get('action') as 'in' | 'out'
  const token = searchParams.get('token')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    if (!action || !token) {
      setMessage('잘못된 접근입니다.')
      setMessageType('error')
    }
  }, [action, token])

  // 휴대폰 번호 유효성 검사
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !phone.trim()) {
      setMessage('이름과 휴대폰 번호를 입력해주세요.')
      setMessageType('error')
      return
    }

    if (!validatePhone(phone)) {
      setMessage('올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // 1. 토큰 검증
      const verifyResponse = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, token })
      })

      const verifyData = await verifyResponse.json()

      if (!verifyData.success) {
        setMessage(verifyData.message || '토큰 검증에 실패했습니다.')
        setMessageType('error')
        return
      }

      // 2. 출퇴근 기록 제출
      const submitResponse = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, token, name, phone })
      })

      const submitData = await submitResponse.json()

      if (submitData.success) {
        setMessage(submitData.message.replace(/\n/g, '<br>'))
        setMessageType('success')
        setName('')
        setPhone('')
      } else {
        setMessage(submitData.message || '제출에 실패했습니다.')
        setMessageType('error')
      }
    } catch (error) {
      console.error('제출 오류:', error)
      setMessage('서버 오류가 발생했습니다.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  if (!action || !token) {
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
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h2 style={{
            color: '#dc3545',
            marginBottom: '20px',
            fontSize: '20px'
          }}>오류</h2>
          <p style={{
            color: '#666',
            fontSize: '14px'
          }}>잘못된 접근입니다.</p>
          <a href="/" style={{
            color: '#007bff',
            textDecoration: 'none',
            marginTop: '20px',
            display: 'inline-block',
            fontSize: '14px'
          }}>
            메인으로 돌아가기
          </a>
        </div>
      </div>
    )
  }

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
          {action === 'in' ? '출근' : '퇴근'} 체크인
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="이름을 입력하세요"
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              휴대폰 번호
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="010-1234-5678"
              disabled={loading}
            />
            <small style={{
              color: '#666',
              fontSize: '12px',
              marginTop: '5px',
              display: 'block'
            }}>
              형식: 010-1234-5678 또는 01012345678
            </small>
          </div>

          {message && (
            <div style={{
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
              color: messageType === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${messageType === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
              fontSize: '14px'
            }}
            dangerouslySetInnerHTML={{ __html: message }}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              background: action === 'in' ? '#007bff' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '처리 중...' : (action === 'in' ? '출근하기' : '퇴근하기')}
          </button>
        </form>
      </div>
    </div>
  )
}
