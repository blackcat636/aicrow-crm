import { getCookieValue } from '@/lib/auth';
import { decodeToken } from '@/lib/auth-utils';

export const coerceNumericUserId = (value: unknown): number | null => {
  const num = typeof value === 'string' ? Number(value) : (value as number);
  if (!Number.isFinite(num)) return null;
  if (num <= 0) return null;
  return num;
};

export const extractNumericUserIdFromAccessToken = (): number | null => {
  const token = getCookieValue('access_token');
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded || typeof decoded !== 'object') return null;

  const obj = decoded as Record<string, unknown>;
  const nestedUser = obj.user;
  const nestedUserId =
    nestedUser && typeof nestedUser === 'object'
      ? (nestedUser as Record<string, unknown>).id
      : null;

  const candidates: unknown[] = [
    obj.id,
    obj.userId,
    nestedUserId,
    obj.sub,
  ];

  for (const v of candidates) {
    const num = coerceNumericUserId(v);
    if (num) return num;
  }

  return null;
};

