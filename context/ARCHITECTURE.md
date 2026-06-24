# fe5oo Barbershop — Architecture

> **Status:** Approved blueprint. Read in full before writing or changing any code.
> **Companion docs:** [UI_DESIGN_RULES.md](./UI_DESIGN_RULES.md) · [BUILD_PLAN.md](./BUILD_PLAN.md) · [PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md) · [MEMORY.md](./MEMORY.md) · [AGENTS.md](./AGENTS.md)

---

## 1. Purpose & Scope

**fe5oo** is an **offline, single-shop barbershop management dashboard** for the "fe5oo BARBERSHOP". One shop, runs on one machine, no internet. An admin manages workers, services, users, and sees analytics; a cashier records customer tickets at the counter. Everything (app + database + assets) lives inside the project folder.

**One-line scope:** A local-only Arabic (RTL) Next.js dashboard where a cashier logs barbershop tickets and an admin runs the shop and reads its numbers.

### In scope
- **Auth:** username + password, bcrypt-hashed, stored in DB. Login page only (no signup UI).
- **RBAC:** two seeded roles — `ADMIN` (full control) and `CASHIER` (can only create/read transaction tickets). Roles stored in DB so more can be added later.
- **Overview page:** period filter (Today / 7 days / 30 days) → total revenue + ticket count KPIs, earnings-per-worker bar chart, top services, revenue trend line.
- **Transactions page:** ticket table (a customer visit = one ticket with one or more service line-items + total). Create / read for cashier; full CRUD for admin.
- **Workers page (admin):** add / edit / delete workers.
- **Services page (admin):** add / edit / delete services (title + price).
- **Audit Log page (admin):** every create / update / delete across the app — who, what, when, before/after.
- **Users & Roles page (admin):** add / edit / deactivate users, assign roles.
- **Settings page (admin):** shop info, theme, **DB backup / restore** (offline-critical).
- **My Profile (all users):** change own password.
- Light (default) + Dark themes. **Arabic-only, RTL** throughout.

### Out of scope (now)
- Internet / cloud / multi-branch / sync. Online payments. SMS/email. Appointment booking / calendar. Inventory/stock. Customer accounts (walk-ins only; no customer table). Commission/payroll math (earnings = sum of service revenue only). i18n/English. Mobile-native app (responsive web is enough).

---

## 2. Target Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router, TS, no `src/`)** | User-locked. RSC for data, server actions for mutations. |
| Language | **TypeScript (strict)** | Safety; no `any`. |
| Styling | **Tailwind CSS v4** | Token-driven utilities; kills hardcoded hex. |
| Components | **shadcn/ui** | User-locked. Accessible, themeable, RTL-friendly. |
| DB | **SQLite** (file in project, e.g. `prisma/fe5oo.db`) | User-locked. Zero-config, offline, lives in app folder. |
| ORM | **Prisma** | User-locked. Type-safe, migrations, seed. |
| Validation | **Zod** | User-locked. Every server-action / form input validated. |
| Auth | **Auth.js (NextAuth v5) — Credentials provider** | Username+password vs hashed `User`, role on session, middleware route protection. Self-contained, offline. |
| Password hash | **bcryptjs** | Pure-JS, no native build — safer for an offline/portable app. |
| Forms | **react-hook-form + zod resolver** | CRUD forms, validation. |
| Tables | **TanStack Table + shadcn DataTable** | Sortable/filterable transaction/worker/service/user/log tables. |
| Charts | **Recharts** via shadcn `ChartContainer` | Bar (per-worker), line (revenue trend), donut/bar (top services). |
| Icons | **lucide-react** | shadcn default. |
| Toasts | **sonner** | Action feedback. |
| Theme | **next-themes** | Light default + dark toggle. |
| Fonts | **Cairo** (headings) + **IBM Plex Sans Arabic** (body), **self-hosted** via `next/font/local` | Offline — no Google CDN at runtime. See UI_DESIGN_RULES §4. |
| Money | **integer EGP** (whole pounds, `ج.م`) | No floats — avoids rounding errors. Store smallest unit; format on display. |

> Whenever you touch an unfamiliar API for any of these libraries, use the `find-docs` skill / `ctx7` CLI to confirm current syntax before coding. Do not rely on memory for library APIs. Prisma + SQLite, Auth.js v5, and Tailwind v4 are the most likely to have drifted.

**Offline non-negotiables:** no runtime calls to any external host. Fonts self-hosted. Icons bundled. No analytics/telemetry. shadcn components are copied into the repo (already the shadcn model). The SQLite file and any backups stay under the project folder.

---

## 3. Project Structure (`app/` at repo root, no `src/`)

```
fe5oo/
├─ logo.png                      # brand (already present)
├─ favicon.ico                   # brand (already present)
├─ prisma/
│  ├─ schema.prisma              # SQLite datasource + models (§5)
│  ├─ seed.ts                    # roles + admin + cashier + sample workers/services
│  ├─ migrations/
│  └─ fe5oo.db                   # the database file (gitignored)
├─ public/
│  └─ fonts/                     # self-hosted Cairo + IBM Plex Sans Arabic (.woff2)
├─ context/                      # these six docs
├─ auth.ts                       # Auth.js config (Credentials, role on session)
├─ middleware.ts                 # route protection + role gating
├─ components.json               # shadcn config
└─ app/
   ├─ layout.tsx                 # <html dir="rtl" lang="ar">, ThemeProvider, Toaster, fonts
   ├─ globals.css                # @theme tokens (light + dark), base RTL rules
   ├─ (auth)/
   │  └─ login/page.tsx          # the only auth screen
   ├─ (dashboard)/
   │  ├─ layout.tsx              # sidebar + topbar + main; server-guards session
   │  ├─ overview/page.tsx       # default landing
   │  ├─ transactions/page.tsx   # ticket table (cashier + admin)
   │  ├─ workers/page.tsx        # admin
   │  ├─ services/page.tsx       # admin
   │  ├─ logs/page.tsx           # admin (audit)
   │  ├─ users/page.tsx          # admin (users + roles)
   │  ├─ settings/page.tsx       # admin (shop info, backup/restore)
   │  └─ profile/page.tsx        # all users (change password)
   └─ api/
      ├─ auth/[...nextauth]/route.ts
      └─ backup/route.ts         # download / restore SQLite file (admin)
   components/
   ├─ ui/                        # shadcn primitives
   ├─ shared/                    # AppSidebar, TopBar, ThemeToggle, PeriodFilter,
   │                            #   DataTable, MoneyCell, RoleBadge, ConfirmDialog,
   │                            #   StatCard, EmptyState
   └─ forms/                     # WorkerForm, ServiceForm, UserForm, TicketForm
   lib/
   ├─ prisma.ts                  # PrismaClient singleton
   ├─ auth.ts                    # session(), requireRole() RBAC helpers
   ├─ audit.ts                   # logAudit({actorId, action, entity, entityId, before, after})
   ├─ money.ts                   # formatEGP(), parseEGP() — integer-safe
   ├─ period.ts                  # resolvePeriod('today'|'7d'|'30d') → {from,to}
   ├─ validators.ts              # all Zod schemas (one place)
   └─ utils.ts                   # cn(), date format (ar-EG)
   actions/                      # server actions, all Zod-validated, all audit-logged
   ├─ workers.ts · services.ts · tickets.ts · users.ts · settings.ts · profile.ts
```

**Conventions**
- One component per file, < ~250 lines; decompose large pages into sections.
- No business data hardcoded in components — flows from `lib/` queries / server actions.
- Every mutation goes through an `actions/*` server action that: validates with Zod → checks role server-side → writes → calls `logAudit()`.
- Absolute imports via `@/`.

---

## 4. Routing & Access Map

`(dashboard)` is session-protected by `middleware.ts`; unauthenticated → `/login`. Role gating is enforced **server-side** in each page/action, not just hidden in the UI.

| Route | Access | Notes |
|---|---|---|
| `/login` | public | Username + password. Only auth screen. |
| `/overview` | ADMIN, CASHIER (read) | Default after login. Cashier sees read-only KPIs. |
| `/transactions` | ADMIN (CRUD), CASHIER (create + read) | Cashier's primary screen — the **only** place cashier can write. |
| `/workers` | ADMIN (CRUD), CASHIER (read) | Cashier views; CRUD controls hidden + server-rejected. |
| `/services` | ADMIN (CRUD), CASHIER (read) | Cashier views; CRUD controls hidden + server-rejected. |
| `/logs` | ADMIN, CASHIER (read) | Read-only audit log for both. |
| `/users` | ADMIN (CRUD), CASHIER (read) | Cashier views the user list; cannot add/edit/deactivate. |
| `/settings` | ADMIN (CRUD), CASHIER (read) | Cashier views shop info; **no backup/restore** (admin-only mutation). |
| `/profile` | ADMIN, CASHIER | Change own password (both). |
| `/` | — | Redirect → `/overview`. |

Cashier landing after login = `/transactions` (their job); admin = `/overview`. **Cashier can READ every page; the only thing a cashier may WRITE is a ticket (create) + their own password.**

---

## 5. Data Model (Prisma / SQLite)

Money fields are **Int** (whole EGP). All timestamps stored UTC, displayed `ar-EG`.

```
Role
  id          String  @id @default(cuid())
  key         String  @unique          // "ADMIN" | "CASHIER" (extensible)
  nameAr      String                    // "مدير" | "كاشير"
  users       User[]

User
  id           String  @id @default(cuid())
  username     String  @unique
  passwordHash String
  fullName     String
  roleId       String
  role         Role    @relation(fields:[roleId], references:[id])
  isActive     Boolean @default(true)
  createdAt    DateTime @default(now())
  tickets      Ticket[]  @relation("CashierTickets")  // who recorded the ticket

Worker
  id        String  @id @default(cuid())
  name      String
  phone     String?
  isActive  Boolean @default(true)      // soft-disable instead of hard delete if referenced
  createdAt DateTime @default(now())
  items     TicketItem[]

Service
  id        String  @id @default(cuid())
  title     String
  price     Int                          // EGP, strict catalog price
  isActive  Boolean @default(true)
  createdAt DateTime @default(now())
  items     TicketItem[]

Ticket                                    // one customer visit
  id         String  @id @default(cuid())
  total      Int                          // sum of item.priceSnapshot (denormalized)
  cashierId  String                        // User who recorded it
  cashier    User    @relation("CashierTickets", fields:[cashierId], references:[id])
  note       String?
  createdAt  DateTime @default(now())      // the metric timestamp for Overview filters
  items      TicketItem[]

TicketItem                                 // one service performed by one worker
  id            String  @id @default(cuid())
  ticketId      String
  ticket        Ticket  @relation(fields:[ticketId], references:[id], onDelete: Cascade)
  workerId      String
  worker        Worker  @relation(fields:[workerId], references:[id])
  serviceId     String
  service       Service @relation(fields:[serviceId], references:[id])
  priceSnapshot Int                         // copy of service.price at sale time (history-safe)

AuditLog
  id         String  @id @default(cuid())
  actorId    String?                        // User who did it (null = system/seed)
  actorName  String                         // snapshot, survives user deletion
  action     String                         // "CREATE" | "UPDATE" | "DELETE" | "LOGIN" (writes only per spec)
  entity     String                         // "Worker" | "Service" | "Ticket" | "User" | "Setting"
  entityId   String?
  summaryAr  String                         // human line: "أضاف عامل: أحمد"
  before     String?                        // JSON snapshot (nullable)
  after      String?                        // JSON snapshot (nullable)
  createdAt  DateTime @default(now())

Setting                                     // single-row-ish key/value for shop config
  key   String @id                          // "shopName" | "shopPhone" | "address" | ...
  value String
```

**Modeling notes (the *why*):**
- **Ticket + TicketItem** (not one flat row): a visit can have several services; `total` lives on Ticket. User picked "ticket with multiple services."
- **`priceSnapshot` on TicketItem:** prices are strict-from-catalog at sale time, but a service's price can change later. Snapshot freezes history so old tickets/Overview numbers never silently rewrite. **The cashier never edits price** — it's copied from `Service.price` server-side on create.
- **Worker earnings** = `SUM(priceSnapshot)` of that worker's TicketItems in the period. No commission field (user choice).
- **Soft-delete (`isActive`)** for Worker/Service that are referenced by tickets — hard delete would orphan history. Truly-unused rows may hard-delete. Users are deactivated, not deleted (audit integrity).
- **AuditLog** is polymorphic via plain `entity`/`entityId` strings + JSON before/after — no FK, so deletes don't break the log. `actorName` snapshotted so the log survives user removal.

---

## 6. Cross-Cutting Behaviors

| Concern | Rule |
|---|---|
| **Period filter** | `lib/period.ts` resolves `today` / `7d` / `30d` to a `{from,to}` UTC window using the shop's local day boundary. Used by every Overview query and the transactions default view. Filter state lives in the URL (`?period=7d`). |
| **Money** | Always Int EGP. `formatEGP(n)` → `"١٢٠ ج.م"` (or Western digits per UI rule). Never do float math; never format in components by hand. |
| **Auth** | Session via Auth.js; role on the JWT/session. `middleware.ts` blocks unauthenticated. Every admin route/action calls `requireRole('ADMIN')` server-side. |
| **RBAC** | Cashier: **read every page**; the only writes allowed are create-ticket + change-own-password. Every other mutation (workers, services, users, settings, ticket edit/delete, backup/restore) = ADMIN. UI hides write controls for cashier **and** the server rejects the action regardless. Read access is broad; write access is narrow. |
| **Audit** | Every create/update/delete on Worker/Service/Ticket/User/Setting calls `logAudit()` inside the same action. Login events optional-extra; spec core = all writes. |
| **Backup/Restore** | `/settings` → download a copy of the SQLite file; restore by uploading one (admin-only, confirm dialog). The offline durability story. |
| **Theme** | next-themes, light default, toggle persists in localStorage. Tokens drive both modes (UI_DESIGN_RULES §2). |
| **RTL** | `<html dir="rtl" lang="ar">`. Logical CSS props only. Charts/time-axis flow right→left. Latin numbers stay LTR inside RTL text. |

---

## 7. Quality Bar / Definition of Done (per screen)

A screen is done when:
1. **Role-correct** — server-enforced access, UI matches the role.
2. **Validated** — every input through a Zod schema; friendly Arabic error messages.
3. **Audited** — every write produces an AuditLog row.
4. **Responsive** at 360px → desktop (sidebar→sheet, table→scroll/stack, charts reflow).
5. **RTL-correct** — logical props, mirrored directional icons, no clipped Arabic.
6. **Both themes** pass contrast (light + dark).
7. **States** — loading / empty / error present where data is fetched.
8. **Money-safe** — integer EGP, formatted via `formatEGP`, tabular numerals in tables.
9. **Typed** — no `any`; `tsc --noEmit` + lint clean.
10. Progress tracker + memory updated (see AGENTS.md).

---

## 8. Non-Negotiables (the build must never violate)

1. **Offline only** — zero runtime network calls. Fonts/icons/assets bundled. DB + backups under the project folder.
2. **`app/` at repo root, no `src/`.**
3. **Money is integer EGP** everywhere. No floats. No per-component formatting.
4. **Every mutation = a Zod-validated server action that role-checks server-side and writes an AuditLog.** No client-trusted writes.
5. **Strict catalog pricing** — `TicketItem.priceSnapshot` is copied from `Service.price` on the server at create time; cashier cannot set or edit price.
6. **RBAC enforced on the server**, not just hidden in UI. Cashier can **read every page** but may only **write a ticket (create)** + change own password — every other mutation is ADMIN-only and server-rejected.
7. **No hardcoded hex in components** — design tokens only (UI_DESIGN_RULES §2).
8. **RTL-safe** — logical CSS props only (`ps/pe/ms/me/start/end`), never `pl/pr/ml/mr/left/right`.
9. **Don't hard-delete referenced Workers/Services/Users** — soft-disable to protect history + audit.
10. **All UI built via the `ui-ux-pro-max` skill**; project design rules override any imported snippet.
11. **Fully responsive** — every page/component works at 360px → desktop (sidebar→sheet, tables scroll-or-stack, charts reflow, touch targets ≥44px). Not "works on desktop." Verify before any UI task is done (UI_DESIGN_RULES §5b).
