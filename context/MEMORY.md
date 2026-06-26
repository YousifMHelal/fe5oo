# fe5oo Barbershop — Memory (Decision Log)

Append-only, newest on top. Records **decisions + their rationale**, open questions, and technical discoveries found during the build. Read the relevant parts before working (AGENTS.md read-order). The rationale column is the point — future-you needs to know *why*.

---

## Project Identity
- **What:** Offline, single-shop barbershop management dashboard for "fe5oo BARBERSHOP".
- **Users:** ADMIN (runs the shop, full control) + CASHIER (records customer tickets only).
- **Source:** User brief (2026-06-24) + project-architect interview (4 question rounds).
- **Brand:** logo.png / favicon.ico — black/charcoal + barber-pole red & blue on white.
- **Runs:** local Next.js server (localhost), SQLite file in the project folder, no internet.

---

## Locked Decisions

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-24 | Stack: Next.js 15 (App Router) + Prisma + **SQLite** + shadcn + Tailwind v4 + Zod | User-locked in brief. |
| 2026-06-24 | **Arabic-only, RTL** (no English / no i18n toggle) | User chose "Arabic only (RTL)". Simplest; logical CSS props throughout. |
| 2026-06-24 | **Light default**, dark via toggle; both required | User chose light default + confirmed both themes. |
| 2026-06-24 | Auth = **username + password, bcrypt-hashed, in DB**; login screen only (no signup UI) | User choice. Roles/users seeded; more addable later via Users page. |
| 2026-06-24 | Two seeded roles **ADMIN / CASHIER**, stored in DB Role table | User wants role-based control + ability to add roles later → roles are DB rows, not an enum. |
| 2026-06-24 | Cashier can **READ every page** (overview, transactions, workers, services, logs, users, settings); the only **writes** allowed are create-ticket + change-own-password. All other mutations admin-only, server-rejected | User clarified (2026-06-24): "cashier can read only all the pages" + original brief "cashier can add ticket rows." Reconciled = broad read, narrow write. Sidebar shows all pages to both roles; write controls gated per-page. |
| 2026-06-24 | Money = **integer EGP** (whole pounds, ج.م) | User chose EGP integers. No floats → no rounding bugs. Format on display via `formatEGP`. |
| 2026-06-24 | Transaction = **Ticket + TicketItem(s)** (one visit, many services, one total) | User chose "ticket with multiple services" over flat one-row. |
| 2026-06-24 | **Strict catalog pricing** — server copies `Service.price` → `TicketItem.priceSnapshot` at create; cashier cannot edit price | User chose strict-from-catalog. Snapshot keeps history correct when a service price later changes. |
| 2026-06-24 | Worker earnings = **SUM(priceSnapshot)** of their items in the period; **no commission** | User chose plain revenue sum (no commission math). |
| 2026-06-24 | Overview widgets: total revenue + ticket count, earnings-per-worker bar, top services, revenue trend line; period filter Today/7d/30d | User picked all four overview widgets + the three period filters. |
| 2026-06-24 | Audit log scope = **all writes** (create/update/delete) on Worker/Service/Ticket/User/Setting; polymorphic AuditLog with before/after JSON + snapshotted actorName | User chose "all writes". No FK so deletes don't break the log. |
| 2026-06-24 | **Offline-only:** no runtime network calls; self-host fonts; DB + backups inside project folder; `/settings` DB backup/restore | User: "runs completely offline, stored in app folders." Backup/restore added as the offline durability story. |
| 2026-06-24 | Fonts: **Cairo** (headings) + **IBM Plex Sans Arabic** (body), self-hosted via `next/font/local` | Arabic-native, legible; self-hosted because no Google CDN allowed offline. |
| 2026-06-24 | Palette derived from logo: **brand red `--primary`** + **barber blue `--secondary`**, charcoal base; **separate `--danger` red** for destructive | Brand fidelity; primary≠danger so "Save" never reads as delete. |
| 2026-06-24 | Auth lib = **Auth.js v5 Credentials** + **bcryptjs** (pure-JS hash) | Self-contained/offline; bcryptjs avoids native build for a portable app. |
| 2026-06-24 | Soft-delete (`isActive`) for Worker/Service/User referenced by tickets; users deactivated never deleted | Hard delete would orphan ticket history + break audit integrity. |
| 2026-06-24 | Extra pages added beyond brief: **Settings** (shop info + backup/restore) + **My Profile** (change password) | User said "add useful pages you see fit." Backup is offline-critical; profile lets non-admins manage their own password. |
| 2026-06-24 | **Fully responsive** is a hard non-negotiable (ARCHITECTURE §8 #11, AGENTS #11), not just a default | User explicitly added it after the docs. 360px → desktop on every page/component. |

---

## Open Questions / To Revisit
- **Digits in money cells:** decided Western digits (0–9) for tabular alignment in tables, Arabic copy in labels (UI §4). Revisit if the user wants Arabic-Indic digits in totals.
- **Day boundary for period filter:** assume the machine's local day. Confirm if the shop runs past midnight and wants "business day" cutoffs.
- **Avg ticket value** KPI on Overview is optional (P6-2) — include if it reads useful; drop if cluttered.
- **Login auth events** in the audit log: spec core = writes only. Add LOGIN entries later if the user wants login tracking.

---

## Technical Discoveries

| Date | Discovery | Impact |
|---|---|---|
| 2026-06-24 | **Next.js 16** (not 15) was installed — `create-next-app` latest is 16.2.9. `middleware.ts` renamed to `proxy.ts`; export named `proxy` not `default`. | All route protection uses `proxy.ts`. |
| 2026-06-24 | **Prisma 7** changed datasource config: URL no longer in `schema.prisma`, moved to `prisma.config.ts`. Schema datasource block has no `url` field. | `schema.prisma` datasource has no url. `prisma.config.ts` holds the env var. |
| 2026-06-24 | **Prisma 7 SQLite** requires explicit driver adapter (`@prisma/adapter-libsql` + `@libsql/client`). `new PrismaClient()` with no args fails with type error requiring `accelerateUrl` or `adapter`. | `lib/prisma.ts` creates `PrismaLibSql` adapter pointing at repo-root `fe5oo.db`. |
| 2026-06-24 | **DB lives at repo root** `fe5oo.db` (not `prisma/fe5oo.db`). `prisma.config.ts` uses `file:./fe5oo.db` relative to CWD (repo root). | Seed + app must resolve `process.cwd()/fe5oo.db`. |
| 2026-06-24 | **Auth.js v5 + edge runtime**: `proxy.ts` cannot import Prisma (Node.js-only). Solution: `auth.config.ts` (edge-safe, no Prisma) for proxy; `auth.ts` (full, with Prisma) for server actions + API routes. | Two auth files: `auth.config.ts` (edge) + `auth.ts` (server). |
| 2026-06-24 | **Auth.js Credentials** `authorize` must return `email` + `emailVerified` (AdapterUser fields). We stub `email` as `username@local` and `emailVerified: null`. Session/JWT carries `username/fullName/role` instead. | Login works without real email; `session.user.email` is the stub value. |
| 2026-06-24 | **shadcn `add form`** hangs silently after registry check in this environment. Created `components/ui/form.tsx` manually from the standard shadcn form implementation. | Form component is manually maintained; not auto-updated by `shadcn add`. |
| 2026-06-24 | **Zod v4** (installed as `zod@^4.x`) — `z.string().min(1)` API is unchanged. No breaking changes for our usage. | No change needed. |
