export function getKSTDate(): Date {
  const now = new Date()
  const kstOffset = 9 * 60 // KST는 UTC+9
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  return new Date(utc + (kstOffset * 60000))
}

export function getKSTDateString(): string {
  const date = getKSTDate()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}` // YYYY-MM-DD
}

export function getKSTTimeString(): string {
  const date = getKSTDate()
  return date.toISOString() // ISO string
}

export function getKSTHour(): number {
  return getKSTDate().getHours()
}

// 시간 제한 제거 - 항상 true 반환
export function isCheckInTime(): boolean {
  return true // 언제든 출근 가능
}

export function isCheckOutTime(): boolean {
  return true // 언제든 퇴근 가능
}

export function isToday(dateString: string): boolean {
  return dateString === getKSTDateString()
}

// 한국 시간 포맷팅 함수 추가
export function formatKSTTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function formatKSTDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
