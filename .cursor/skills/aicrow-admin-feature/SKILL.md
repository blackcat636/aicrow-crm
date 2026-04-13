---
name: aicrow-admin-feature
description: Планує та реалізує фічу в адмінці (сторінка app/(admin), таблиця, діалог, store, lib/api). Use when building admin CRUD screens, new list pages, or workflows matching existing admin patterns.
---

# Admin feature workflow

## Discover

1. Відкрий схожу сторінку в `app/(admin)/` (layout, sidebar у `components/app-sidebar.tsx`).
2. Подивись data-table у `components/*/` і відповідний `store/use*Store.ts` + `lib/api/*.ts`.

## Build order (typical)

1. Типи в `interface/` або локально, узгоджені з API.
2. Клієнтський клієнт у `lib/api/<feature>.ts` (використовуй `fetchWithAuth` / існуючі helper-и).
3. Zustand store: пагінація, фільтри, `fetch*` як у сусідніх store.
4. UI: таблиця + діалогі; Radix + `components/ui`; `toast` для успіху/помилки.
5. За потреби — новий `app/api/admin/...` проксі (див. skill `aicrow-add-api-proxy`).

## Quality bar

- Доступ: `permission-guard` / `module-route-guard` — копіюй патерн зі сторінок того ж модуля.
- Порожні стани й loading — як у існуючих таблиць.
- Після зміни даних — онови список (refetch з store), не залишай застарілий UI.
