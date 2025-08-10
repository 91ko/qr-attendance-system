import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ 
          color: '#333', 
          marginBottom: '30px',
          fontSize: '24px'
        }}>
          QR 출퇴근 관리 시스템
        </h1>
        
        <div style={{ marginBottom: '20px' }}>
          <Link href="/admin" style={{
            display: 'inline-block',
            background: '#007bff',
            color: 'white',
            padding: '12px 24px',
            textDecoration: 'none',
            borderRadius: '5px',
            marginBottom: '10px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            관리자 페이지
          </Link>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <Link href="/checkin" style={{
            display: 'inline-block',
            background: '#28a745',
            color: 'white',
            padding: '12px 24px',
            textDecoration: 'none',
            borderRadius: '5px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            출퇴근 체크인
          </Link>
        </div>
        
        <div>
          <Link href="/stats" style={{
            display: 'inline-block',
            background: '#6f42c1',
            color: 'white',
            padding: '12px 24px',
            textDecoration: 'none',
            borderRadius: '5px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            근무 통계 조회
          </Link>
        </div>
      </div>
    </div>
  )
}
