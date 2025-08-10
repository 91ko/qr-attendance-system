export function getKSTDate(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
}

export function getKSTDateString(): string {
  const date = getKSTDate();
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function getKSTTimeString(): string {
  const date = getKSTDate();
  return date.toISOString(); // ISO string
}

export function getKSTHour(): number {
  return getKSTDate().getHours();
}

// 시간 제한 제거 - 항상 true 반환
export function isCheckInTime(): boolean {
  return true; // 언제든 출근 가능
}

export function isCheckOutTime(): boolean {
  return true; // 언제든 퇴근 가능
}

export function isToday(dateString: string): boolean {
  return dateString === getKSTDateString();
}
