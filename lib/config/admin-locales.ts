const FALLBACK_LOCALES = ['en', 'uk', 'ru', 'fr', 'es'] as const;

function parseLocaleListEnv(
  raw: string | undefined,
  fallback: readonly string[]
): readonly string[] {
  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(',')) {
    const code = part.trim().toLowerCase();
    if (!code || seen.has(code)) continue;
    seen.add(code);
    out.push(code);
  }
  return out.length > 0 ? out : [...fallback];
}

function resolveDefaultLocale(
  locales: readonly string[],
  requested: string | undefined
): string {
  const r = (requested?.trim().toLowerCase() || FALLBACK_LOCALES[0])!;
  if (locales.includes(r)) return r;
  return locales[0] ?? 'en';
}

/** Active locale codes (from env or fallback). */
export const ADMIN_LOCALES = parseLocaleListEnv(
  process.env.NEXT_PUBLIC_ADMIN_LOCALES,
  FALLBACK_LOCALES
);

export type AdminLocale = string;

/** Default locale for variant A (plain string) and display preference. */
export const ADMIN_DEFAULT_LOCALE: AdminLocale = resolveDefaultLocale(
  ADMIN_LOCALES,
  process.env.NEXT_PUBLIC_ADMIN_DEFAULT_LOCALE
);
