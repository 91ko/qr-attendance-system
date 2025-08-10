'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'

export default function AdminPage() {
  const [checkInQR, setCheckInQR] = useState<string>('')
  const [checkOutQR, setCheckOutQR] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

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
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          color: '#333', 
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          관리자 페이지
        </h1>
        
        {error && (
          <div style={{
            padding: '12px',
            borderRadius: '5px',
            marginBottom: '20px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <button
            onClick={() => generateQR('in')}
            disabled={loading}
            style={{
              flex: 1,
              padding: '15px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            출근 QR 생성
          </button>
          
          <button
            onClick={() => generateQR('out')}
            disabled={loading}
            style={{
              flex: 1,
              padding: '15px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            퇴근 QR 생성
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h3 style={{ marginBottom: '15px', color: '#007bff' }}>출근 QR</h3>
            {checkInQR ? (
              <img 
                src={checkInQR} 
                alt="출근 QR" 
                style={{ 
                  maxWidth: '100%', 
                  border: '2px solid #007bff',
                  borderRadius: '5px'
                }} 
              />
            ) : (
              <div style={{
                width: '200px',
                height: '200px',
                border: '2px dashed #ccc',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                color: '#999'
              }}>
                QR 코드가 없습니다
              </div>
            )}
          </div>
          
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h3 style={{ marginBottom: '15px', color: '#dc3545' }}>퇴근 QR</h3>
            {checkOutQR ? (
              <img 
                src={checkOutQR} 
                alt="퇴근 QR" 
                style={{ 
                  maxWidth: '100%', 
                  border: '2px solid #dc3545',
                  borderRadius: '5px'
                }} 
              />
            ) : (
              <div style={{
                width: '200px',
                height: '200px',
                border: '2px dashed #ccc',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                color: '#999'
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
            textDecoration: 'none'
          }}>
            ← 메인으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  )
}
