---
name: aicrow-review-stack
description: Рев’ю змін з урахуванням Next 15, проксі API, auth cookies, Zustand і strict TypeScript. Use when reviewing PRs, diffs, or security-sensitive changes in this repo.
---

# Code review (aicrow-crm)

## Auth and API

- Чи не витікають токени в клієнтські логи / помилки?
- Проксі routes: чи форвардиться `Authorization` / cookie; чи коректні статуси від бекенду.
- Клієнтські `fetch`: чи використано `fetchWithAuth` або узгоджений патерн.

## React / Next

- Чи зайвий `'use client'` на серверних сторінках?
- Чи немає великої логіки в `page.tsx`, яку варто винести в компоненти/hooks.

## Data and state

- Zustand: чи немає дубльованого джерела правди з props без потреби.
- Після мутацій — чи оновлюється UI.

## TypeScript and UX

- Уникнення `any`, осмислені типи для відповідей API.
- Форми: валідація (Zod) для нових складних полів; повідомлення користувачу при помилках.

## Output format

- Критичне / важливе / бажане; приклади рядків або файлів; без загальних порад без прив’язки до репозиторію.
