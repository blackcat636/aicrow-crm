---
name: aicrow-add-api-proxy
description: Додає або змінює Next.js Route Handler у app/api або app/admin (BFF без префікса /api), що проксує зовнішній бекенд (NEXT_PUBLIC_API_URL) з cookie/header auth. Use when adding API routes, proxy endpoints, or forwarding admin API calls.
---

# Add API proxy route

## Before coding

1. Знайди найближчий існуючий route з тим самим префіксом ресурсу (`app/api/admin/...` або, як subscription-plans, `app/admin/...` для URL `/admin/...` без `/api`).
2. Перевір `lib/api/*.ts` на очікуваний шлях і query/body.

## Implementation checklist

- [ ] `GET`/`POST`/`PATCH`/`DELETE` — сигнатура як у сусідніх файлах; імпорт `NextRequest`, `NextResponse`.
- [ ] `API_URL` з `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'` + `.replace(/\/+$/, '')`.
- [ ] Токен: `request.headers.get('authorization')` або `Bearer ${request.cookies.get('access_token')?.value}`.
- [ ] Прокинути query з `request.nextUrl.searchParams` або body через `await request.json()` за потреби.
- [ ] `fetch(upstream, { headers: { Authorization: authHeader, 'Content-Type': 'application/json' }, ... })`.
- [ ] Повернути `NextResponse.json` з тим самим `status`, що від бекенду, або змістовна помилка в `catch`.

## Do not

- Не змінюй глобальну поведінку `middleware.ts` без явного завдання.
- Не дублюй бізнес-логіку бекенду в Next — лише проксі й адаптація запиту/відповіді.
