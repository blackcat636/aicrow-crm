import { AuditLog } from '@/interface/AuditLog';

type UnknownRecord = Record<string, unknown>;

type UserRecord = UnknownRecord;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

const getNumber = (value: unknown): number | null =>
  typeof value === 'number' ? value : null;

const extractUserRecord = (source: unknown, path: string[]): UserRecord | null => {
  if (!isRecord(source)) {
    return null;
  }

  let current: UnknownRecord | null = source;

  for (const key of path) {
    if (!current) {
      return null;
    }

    const next: unknown = current[key];
    if (!isRecord(next)) {
      return null;
    }

    current = next;
  }

  return current;
};

const buildUserInfo = (user: UserRecord, fallback: UserInfo): UserInfo => {
  const id = getNumber(user.id) ?? fallback.id;
  const email = getString(user.email) ?? fallback.email;
  const role = getString(user.role) ?? fallback.role;

  const firstName = getString(user.firstName)?.trim();
  const lastName = getString(user.lastName)?.trim();
  const username = getString(user.username);
  const displayEmail = getString(user.email);

  const nameCandidates = [
    firstName && lastName ? `${firstName} ${lastName}`.trim() : undefined,
    username,
    displayEmail,
    fallback.name,
  ];

  const name = nameCandidates.find(candidate => Boolean(candidate)) ?? fallback.name;

  return {
    id,
    name,
    email: email ?? null,
    role: role ?? null,
  };
};

export interface UserInfo {
  id: number | null;
  name: string;
  email: string | null;
  role: string | null;
}

export const getUserInfoFromLog = (log: AuditLog): UserInfo => {
  const fallback: UserInfo = {
    id: log.userId ?? null,
    name: log.userEmail || 'Unknown',
    email: log.userEmail ?? null,
    role: log.userRole ?? null,
  };

  const fromNewValues = extractUserRecord(log.newValues, ['user']);
  if (fromNewValues) {
    return buildUserInfo(fromNewValues, fallback);
  }

  const fromMetadata = extractUserRecord(log.metadata, ['session', 'user']);
  if (fromMetadata) {
    return buildUserInfo(fromMetadata, fallback);
  }

  return fallback;
};
