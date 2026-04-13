/**
 * Helpers for API translatable fields: plain string (default locale) or per-locale object.
 */

export type TranslatableApiValue =
  | string
  | Record<string, string>
  | null
  | undefined;

/** Empty map for all configured locale codes. */
export function emptyTranslatableMap(
  locales: readonly string[]
): Record<string, string> {
  return Object.fromEntries(locales.map((l) => [l, ''])) as Record<
    string,
    string
  >;
}

export function isTranslatableRecord(
  value: unknown
): value is Record<string, string> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  return Object.values(value).every(
    (v) => v === undefined || typeof v === 'string'
  );
}

/**
 * If `s` is a JSON object with only string values (locale map), return it; otherwise null.
 */
export function parseTranslatableRecordFromJsonString(
  s: string
): Record<string, string> | null {
  const t = s.trim();
  if (t.length < 2 || t[0] !== '{') return null;
  try {
    const p = JSON.parse(t) as unknown;
    if (!isTranslatableRecord(p)) return null;
    if (Object.keys(p).length === 0) return null;
    return p;
  } catch {
    return null;
  }
}

/** True if value is a non-empty string or an object with at least one non-empty string (after trim). */
export function hasTranslatableContent(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (!isTranslatableRecord(value)) return false;
  return Object.values(value).some(
    (v) => typeof v === 'string' && v.trim().length > 0
  );
}

/**
 * Merge API payload into a fixed set of locale keys (form state).
 */
export function normalizeFromApi(
  value: TranslatableApiValue,
  defaultLocale: string,
  locales: readonly string[]
): Record<string, string> {
  const base = emptyTranslatableMap(locales);
  if (value === null || value === undefined) return base;
  if (typeof value === 'string') {
    const parsed = parseTranslatableRecordFromJsonString(value);
    if (parsed) {
      const next = { ...base };
      for (const loc of locales) {
        const raw = parsed[loc];
        if (typeof raw === 'string') next[loc] = raw;
      }
      return next;
    }
    return { ...base, [defaultLocale]: value };
  }
  if (!isTranslatableRecord(value)) return base;
  const next = { ...base };
  for (const loc of locales) {
    const raw = value[loc];
    if (typeof raw === 'string') next[loc] = raw;
  }
  return next;
}

/**
 * Variant A: single non-empty default locale → string.
 * Variant B: multiple locales or non-default only → object with trimmed non-empty values only.
 */
export function serializeForApi(
  map: Record<string, string>,
  defaultLocale: string
): string | Record<string, string> {
  const trimmed: Record<string, string> = {};
  for (const [k, v] of Object.entries(map)) {
    const t = (v ?? '').trim();
    if (t !== '') trimmed[k] = t;
  }
  const keys = Object.keys(trimmed);
  if (keys.length === 0) return '';
  if (keys.length === 1 && keys[0] === defaultLocale) {
    return trimmed[defaultLocale]!;
  }
  return trimmed;
}

/** Same as serializeForApi but returns null when everything is empty (optional fields). */
export function serializeNullableForApi(
  map: Record<string, string>,
  defaultLocale: string
): string | Record<string, string> | null {
  const trimmed: Record<string, string> = {};
  for (const [k, v] of Object.entries(map)) {
    const t = (v ?? '').trim();
    if (t !== '') trimmed[k] = t;
  }
  const keys = Object.keys(trimmed);
  if (keys.length === 0) return null;
  if (keys.length === 1 && keys[0] === defaultLocale) {
    return trimmed[defaultLocale]!;
  }
  return trimmed;
}

export function pickDisplayString(
  value: TranslatableApiValue,
  defaultLocale: string
): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') {
    const parsed = parseTranslatableRecordFromJsonString(value);
    if (parsed) return pickDisplayString(parsed, defaultLocale);
    return value;
  }
  if (!isTranslatableRecord(value)) return '';
  const preferred = value[defaultLocale]?.trim();
  if (preferred) return preferred;
  const first = Object.values(value).find(
    (v) => typeof v === 'string' && v.trim().length > 0
  );
  return typeof first === 'string' ? first.trim() : '';
}

export function isDefaultLocaleFilled(
  map: Record<string, string>,
  defaultLocale: string
): boolean {
  return (map[defaultLocale] ?? '').trim().length > 0;
}

/**
 * Normalize outbound payload for proxies: trim strings; trim string values in objects; drop empty string keys in objects.
 */
export function trimTranslatableForBackend(
  value: unknown
): string | Record<string, string> {
  if (typeof value === 'string') return value.trim();
  if (!isTranslatableRecord(value)) {
    return '';
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v !== 'string') continue;
    const t = v.trim();
    if (t !== '') out[k] = t;
  }
  return out;
}

/** Optional description: null when empty after trim. */
export function trimNullableTranslatableForBackend(
  value: unknown
): string | Record<string, string> | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const t = value.trim();
    return t === '' ? null : t;
  }
  const trimmed = trimTranslatableForBackend(value);
  if (typeof trimmed === 'object' && Object.keys(trimmed).length === 0) {
    return null;
  }
  return trimmed as Record<string, string>;
}

/**
 * Trim values but keep every key (empty string stays). Use for PUT so backend can clear a locale.
 */
export function trimTranslatableMapPreserveEmptyKeys(
  value: unknown
): string | Record<string, string> {
  if (typeof value === 'string') return value.trim();
  if (!isTranslatableRecord(value)) {
    return '';
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v !== 'string') continue;
    out[k] = v.trim();
  }
  return out;
}

/** PUT payload for optional description: preserve empty locale values; null if all empty. */
export function trimNullableTranslatableForPutPreserveEmpty(
  value: unknown
): string | Record<string, string> | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const t = value.trim();
    return t === '' ? null : t;
  }
  const m = trimTranslatableMapPreserveEmptyKeys(value);
  if (typeof m === 'string') return m === '' ? null : m;
  if (Object.keys(m).length === 0) return null;
  if (Object.values(m).every((v) => v === '')) return null;
  return m;
}

/** Normalize name for PUT: string or map with empty keys kept. */
export function normalizeNameForPut(bodyName: unknown): string | Record<string, string> {
  if (typeof bodyName === 'string') return bodyName.trim();
  const m = trimTranslatableMapPreserveEmptyKeys(bodyName);
  if (typeof m === 'string') return m;
  if (Object.keys(m).length === 0) return '';
  return m;
}

/** Full locale map for PUT (all configured keys, trimmed; empty string allowed). */
export function serializeTranslatableMapForPut(
  map: Record<string, string>,
  locales: readonly string[]
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const loc of locales) {
    out[loc] = (map[loc] ?? '').trim();
  }
  return out;
}

export function serializeNullableDescriptionForPut(
  map: Record<string, string>,
  locales: readonly string[]
): Record<string, string> | null {
  const full = serializeTranslatableMapForPut(map, locales);
  if (locales.every((l) => full[l] === '')) return null;
  return full;
}

/**
 * Edit PUT: only locales that differ from the snapshot loaded from the API.
 * Some backends merge full maps poorly when many locales are sent as empty strings;
 * partial maps behave like per-locale updates.
 */
export function buildTranslatableFieldDeltaForPut(
  current: Record<string, string>,
  initial: Record<string, string>,
  locales: readonly string[]
): Record<string, string> | undefined {
  const delta: Record<string, string> = {};
  let hasChange = false;
  for (const loc of locales) {
    const c = (current[loc] ?? '').trim();
    const i = (initial[loc] ?? '').trim();
    if (c !== i) {
      delta[loc] = c;
      hasChange = true;
    }
  }
  return hasChange ? delta : undefined;
}

/** Optional description: undefined = omit field; null = clear all (had content before). */
export function buildNullableDescriptionDeltaForPut(
  current: Record<string, string>,
  initial: Record<string, string>,
  locales: readonly string[]
): Record<string, string> | null | undefined {
  const delta: Record<string, string> = {};
  let hasChange = false;
  for (const loc of locales) {
    const c = (current[loc] ?? '').trim();
    const i = (initial[loc] ?? '').trim();
    if (c !== i) {
      delta[loc] = c;
      hasChange = true;
    }
  }
  if (!hasChange) return undefined;
  const allEmptyNow = locales.every((l) => (current[l] ?? '').trim() === '');
  if (allEmptyNow) return null;
  return delta;
}
