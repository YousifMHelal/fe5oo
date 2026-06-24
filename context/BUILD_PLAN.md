# fe5oo Barbershop — Build Plan

Phased, dependency-ordered. Each task has a stable ID. When done: tick the box here **and** set the task DONE in `PROGRESS_TRACKER.md` with a changelog entry. Don't start a phase before its predecessor's blocking tasks are done.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done

> **All UI tasks:** build with the `ui-ux-pro-max` skill (+ shadcn MCP), fully responsive, per `UI_DESIGN_RULES.md`. **All mutations:** Zod-validated server action → server-side role check → write → `logAudit()` (per ARCHITECTURE §8).

---

## Phase 0 — Scaffold & Foundations

- [x] **P0-1** Init Next.js 15 (App Router, TS strict, **no `src/`**, Tailwind v4, ESLint). Set `app/layout.tsx` to `<html dir="rtl" lang="ar">`.
- [x] **P0-2** Install + init shadcn/ui (`components.json`); add base primitives: button, card, dialog, table, badge, input, label, select, dropdown-menu, sheet, tabs, tooltip, separator, skeleton, sonner, form, alert-dialog.
- [x] **P0-3** `next-themes` provider (**light default**); define light + dark token sets in `globals.css` per UI_DESIGN_RULES §2.
- [x] **P0-4** Self-host fonts: Cairo + IBM Plex Sans Arabic in `public/fonts/`, wired via `next/font/local`; base RTL rules in `globals.css`.
- [x] **P0-5** Prisma init with **SQLite** datasource (`prisma/fe5oo.db`), `lib/prisma.ts` singleton, `.gitignore` the db file. Add `lib/money.ts`, `lib/period.ts`, `lib/utils.ts`, `lib/validators.ts` stubs.
- [x] **P0-6** **Auth.js v5 (Credentials)**: `auth.ts` (username+password vs bcrypt hash, role on session), `app/api/auth/[...nextauth]`, `proxy.ts` (protect `(dashboard)`), `lib/auth.ts` (`session()` + `requireRole()`). `/login` page (the only auth screen). Cashier → `/transactions`, admin → `/overview` after login.

**Exit:** app boots in Arabic RTL, light/dark toggle works, empty SQLite connects, login works + protects routes.

---

## Phase 1 — Data Model & Seed

- [x] **P1-1** Write full `schema.prisma` — all entities in ARCHITECTURE §5 (Role, User, Worker, Service, Ticket, TicketItem, AuditLog, Setting).
- [x] **P1-2** Migrate (`prisma migrate dev`).
- [x] **P1-3** `lib/audit.ts` (`logAudit`) + `lib/money.ts` (`formatEGP`/`parseEGP`, integer-safe) + `lib/period.ts` (today/7d/30d → {from,to}). Unit-sanity money + period.
- [x] **P1-4** `prisma/seed.ts` — 2 roles (ADMIN/CASHIER), 1 admin user + 1 cashier user (bcrypt-hashed), ~6 workers, ~8 services, ~30 sample tickets across the last 30 days (mixed workers/services) so Overview has real data. Seed Setting (shopName "fe5oo BARBERSHOP", phone, address).
- [x] **P1-5** Run seed, verify counts + that totals/snapshots are consistent.

**Exit:** DB has realistic data; login with seeded admin + cashier works.

---

## Phase 2 — App Shell

- [x] **P2-1** `(dashboard)/layout.tsx` — sidebar + topbar + main grid; server-guards session, redirects unauthenticated → `/login`.
- [x] **P2-2** `AppSidebar` (shared): logo, nav links with lucide icons (UI §11), active state, **all pages shown to both roles** (cashier reads everything), collapsible rail (`lg+`) + `Sheet` drawer on mobile. Per-page write controls are gated, not the nav.
- [x] **P2-3** `TopBar`: shop name, `PeriodFilter` (Today/7d/30d, writes `?period=`), `ThemeToggle`, account menu (name, role badge, logout, profile link).
- [x] **P2-4** Shared primitives: `StatCard`, `DataTable` (TanStack), `MoneyCell`, `StatusPill`, `RoleBadge`, `ConfirmDialog`, `EmptyState`, `PageHeader`.
- [x] **P2-5** Root `/` → redirect to `/overview` (admin) / `/transactions` (cashier).

**Exit:** can navigate all role-permitted routes (empty content), period filter updates URL, theme + logout work.

---

## Phase 3 — Services (admin CRUD) *(simplest entity — proves the CRUD pattern first)*

- [x] **P3-1** `lib/validators.ts` service schema (title, price ≥ 0 int). `actions/services.ts` — create/update/delete (soft-disable if referenced), all audited.
- [x] **P3-2** `/services` page: DataTable (title, price `MoneyCell`, status, created), search, sort.
- [x] **P3-3** `ServiceForm` dialog (add/edit) + `ConfirmDialog` delete. Admin-only (server + UI).

**Exit:** admin can fully manage services; every change appears in AuditLog. CRUD pattern is set for Workers/Users to follow.

---

## Phase 4 — Workers (admin CRUD)

- [x] **P4-1** Worker schema + `actions/workers.ts` (create/update/delete→soft-disable if referenced, audited).
- [x] **P4-2** `/workers` page: DataTable (name, phone, status, created), search, sort.
- [x] **P4-3** `WorkerForm` dialog + delete confirm. Admin-only.

**Exit:** admin manages workers; audited.

---

## Phase 5 — Transactions (the cashier's core)

- [x] **P5-1** Ticket/TicketItem schema confirmed; `actions/tickets.ts` — `createTicket` (line-items: workerId + serviceId; server copies `Service.price` → `priceSnapshot`; computes `total`; rejects inactive worker/service; sets `cashierId` from session), `updateTicket`/`deleteTicket` (**admin-only**). All audited.
- [x] **P5-2** `/transactions` page: DataTable of tickets (date, cashier, item count, total, expand → line-items: worker · service · price). Default to `?period=today`. Search + period filter.
- [x] **P5-3** `TicketForm`: add one or more line-items (worker select + service select; price auto-fills read-only from catalog; running total). Available to **cashier + admin**.
- [x] **P5-4** Edit/delete ticket = admin-only (server-enforced; UI hides for cashier). Confirm dialog.

**Exit:** cashier can record multi-service tickets with correct catalog prices + totals; admin can edit/delete; all audited. Cashier can read every page but write nothing except tickets (+ own password) — verified server-side.

---

## Phase 6 — Overview (analytics)

- [x] **P6-1** `lib/queries/overview.ts` — period-filtered: total revenue, ticket count, earnings-per-worker (`SUM(priceSnapshot)` grouped by worker), top services (by revenue), daily revenue trend.
- [x] **P6-2** KPI row: total revenue + ticket count + (optional avg ticket) `StatCard`s, driven by `?period=`.
- [x] **P6-3** Earnings-per-worker **bar chart** (Recharts, `--primary`, sorted desc).
- [x] **P6-4** Revenue **trend line/area** (`--secondary`, RTL axis) + **top services** bar/donut.
- [x] **P6-5** Wire all to `PeriodFilter`. Empty states for periods with no data.

**Exit:** Overview shows correct numbers per Today/7d/30d; matches the transactions data.

---

## Phase 7 — Users & Roles (admin)

- [x] **P7-1** User schema + `actions/users.ts` — create (bcrypt hash, assign role), update (name/role/active), **deactivate** (no hard delete), reset password. Audited. Guard: can't deactivate the last active admin.
- [x] **P7-2** `/users` page: DataTable (username, fullName, `RoleBadge`, active, created), search.
- [x] **P7-3** `UserForm` (add/edit, role select from DB Role table — extensible), deactivate confirm.

**Exit:** admin manages users + role assignment; roles read from DB; audited.

---

## Phase 8 — Audit Log + Profile + Settings

- [x] **P8-1** `/logs` page (admin): read-only DataTable of AuditLog (when, actor, action, entity, summaryAr), filter by entity/action + search, row expand → before/after JSON (pretty). Period filter.
- [x] **P8-2** `/profile` (all users): `actions/profile.ts` change-password (verify current, bcrypt new, Zod). Show username + role (read-only).
- [x] **P8-3** `/settings` (admin): shop info form (name/phone/address → Setting) via `actions/settings.ts`, audited.
- [x] **P8-4** Backup/Restore: `app/api/backup/route.ts` — download SQLite file; restore via upload with heavy `ConfirmDialog` (admin-only). Offline durability.

**Exit:** full audit visibility, password self-service, shop config + DB backup/restore work.

---

## Phase 9 — Hardening & Production-Ready

- [ ] **P9-1** Loading skeletons + error states per page/table/chart; empty states everywhere.
- [ ] **P9-2** RBAC audit — cashier can READ every page; confirm every admin **mutation** (workers/services/users/settings/ticket-edit-delete/backup) rejects cashier server-side, not just hidden. Only create-ticket + change-own-password succeed for cashier.
- [ ] **P9-3** RTL pass — every page/table/chart mirrors correctly; no clipped Arabic; directional icons mirrored.
- [ ] **P9-4** Responsive pass — every page at 360px → desktop (sidebar→sheet, tables scroll/stack, charts reflow).
- [ ] **P9-5** Money audit — all amounts integer EGP via `formatEGP`, tabular numerals, no float anywhere.
- [ ] **P9-6** Accessibility — focus-visible, labels, color+icon+text status, contrast in both themes.
- [ ] **P9-7** Offline audit — grep for any external host / CDN font / telemetry; remove. Confirm db + backups stay in-folder.
- [ ] **P9-8** `README.md` — run instructions (install, migrate, seed, start), seeded credentials, backup/restore steps, how it stays offline.

**Exit:** functionally production-ready, fully offline, RBAC-tight.

---

## Phase 10 — Polish *(final pass — premium feel)*

- [ ] **P10-1** `ui-ux-pro-max` full review pass — spacing rhythm, hierarchy, density per UI_DESIGN_RULES.
- [ ] **P10-2** Micro-interactions — hover/dialog/filter transitions ≤150ms; respect `prefers-reduced-motion`; no layout shift.
- [ ] **P10-3** Visual consistency audit via `ui-registry.md` (imprint) — every page matches tokens, StatCard, StatusPill, table shell, type scale.
- [ ] **P10-4** Polished empty/loading/error states (skeletons match real layout, friendly Arabic copy).
- [ ] **P10-5** Chart polish — legends, tooltips, EGP number formatting, RTL axes, color ramps.
- [ ] **P10-6** Light + dark parity review; brand red vs danger red never confusable; status contrast a11y-safe both themes.
- [ ] **P10-7** RTL polish — Arabic typography (Cairo/Plex), mirrored icons/charts, no clipping at any breakpoint.
- [ ] **P10-8** Login + shell + nav first-impression polish (logo, brand red accents).
- [ ] **P10-9** Final walkthrough on real device widths (mobile/tablet/desktop) × both themes, as admin and as cashier.

**Exit:** production-ready **and** polished.

---

## Build Order Summary
P0 (scaffold) → P1 (data + seed) → P2 (shell) → **P3 Services (proves CRUD)** → P4 Workers → **P5 Transactions (cashier core)** → P6 Overview (analytics) → P7 Users/Roles → P8 Logs/Profile/Settings/Backup → P9 Hardening → **P10 Polish**.
