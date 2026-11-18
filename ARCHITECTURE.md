# Silid One — RND Next.js Architecture

This project follows the **RND Next.js Template** (`Next.js 16 + React 19 + Drizzle ORM + Better Auth + PWA + Atomic Design UI`).

## Layout

- `database/index.ts` & `drizzle/schema.ts`: MySQL 8 connection pool (`mysql2/promise`) and Drizzle schema (`drizzle/schema.ts` + `drizzle/relations.ts`, containing Better Auth's `user`, `session`, `account`, `verification` plus introspected Silid tables `class_card`, `activities`, `post`, `class_work_category`, `term`, `participants`, etc.).
- `auth.ts` & `app/api/auth/[...all]/route.ts`: Better Auth with Drizzle MySQL adapter, `nextCookies()`, and `emailAndPassword` enabled (`role` defaults to `"dev"`).
- `proxy.ts`: Cookie/session route guard (redirects unauthenticated requests on guarded routes such as `/users` to `/login`).
- `lib/entities/*.type.ts`: Domain types inferred from Drizzle tables plus `USER_ROLE`, `USER_PERMISSION`, `ROLE_PERMISSIONS`, and `hasPermission()`.
- `lib/domain/usecases/<table>/*.usecase.ts`: Single-operation database/auth/storage modules (`"use cache"` + `cacheLife`/`cacheTag` on reads; `updateTag` on writes).
- `lib/domain/services/*.service.ts`: Orchestration modules + `auth()` session/role loader for actions.
- `lib/domain/actions/*.actions.ts`: `"use server"` entrypoints using the inline AAA `try/catch` template (`auth()` -> `hasPermission()` -> `logAction()`).
- `components/` + `*.hooks.ts`: Atomic Design components (`atoms`, `molecules`, `organisms`, `templates`) with collocated client hook handlers (`loginFormSection.hooks.ts`, `userCard.hooks.ts`, `storagePanel.hooks.ts`).
- `app/manifest.ts`, `public/sw.js`, `app/landing/page.tsx`: PWA install manifest, service worker, and browser storage (`rnd_pwa`) landing demo.

## Database Commands (Bun)

```bash
bun install
bun run db:pull
bun run dev
```
