import crypto from 'crypto';
import { getKSTDateString } from './tz';

export function generateToken(action: 'in' | 'out', date: string): string {
  const secret = process.env.SECRET;
  if (!secret) {
    throw new Error('SECRET environment variable is required');
  }
  
  const data = `${action}:${date}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export function verifyToken(action: 'in' | 'out', token: string, date: string): boolean {
  const expectedToken = generateToken(action, date);
  return token === expectedToken;
}

export function generateQRUrl(action: 'in' | 'out'): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const date = getKSTDateString();
  const token = generateToken(action, date);
  
  return `${baseUrl}/checkin?action=${action}&token=${token}`;
}
