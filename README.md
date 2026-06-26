# ✂️ fe5oo BARBERSHOP

> نظام إدارة صالون الحلاقة — Offline-first Arabic RTL barbershop management dashboard for a single shop.

![Next.js](https://img.shields.io/badge/-Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/-Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/-Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/-shadcn%2Fui-18181B?style=for-the-badge&logo=shadcnui&logoColor=white)

---

## 📋 Table of Contents

- [Introduction](#introduction)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [RBAC](#rbac)
- [Backup & Restore](#backup--restore)

---

## Introduction

**fe5oo** is a fully offline, Arabic-only (RTL) management dashboard for a single barbershop. A cashier logs customer visits at the counter while an admin manages workers, services, users, and views business analytics — all without an internet connection.

Every dependency (fonts, icons, database) is self-contained inside the project folder. No CDN, no telemetry, no cloud.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 (App Router) | Framework — RSC for data fetching, Server Actions for mutations |
| TypeScript (strict) | Type safety, no `any` |
| Tailwind CSS v4 | Token-driven styling, full dark/light mode |
| shadcn/ui | Accessible, themeable component library |
| Prisma 7 | ORM — type-safe queries, migrations, seeding |
| SQLite (libsql) | Local database file, zero config, fully offline |
| Auth.js v5 | Credentials-based authentication, JWT sessions, RBAC |
| bcryptjs | Password hashing (pure JS, no native build) |
| Zod | Schema validation on every server action |
| react-hook-form | Form state and validation |
| TanStack Table | Sortable/filterable data tables |
| Recharts | Charts — area, bar, grouped bar |
| next-themes | Light/dark theme toggle, persisted in localStorage |
| sonner | Toast notifications |
| lucide-react | Icons |
| Cairo + IBM Plex Sans Arabic | Self-hosted Arabic fonts (`public/fonts/`) |

---

## Features

- 📊 **Overview dashboard** — KPI cards (total revenue, ticket count, average ticket), per-worker revenue vs. expenses bar chart, top services bar, daily revenue area trend; all filterable by Today / 7 days / 30 days
- 🧾 **Transactions** — create multi-service tickets (cashier), full CRUD (admin), price locked at sale time via `priceSnapshot`
- 👷 **Workers** — add/edit/soft-disable workers, track advances/expenses per worker
- 💈 **Services** — manage service catalog with EGP prices (integer, no floats)
- 👥 **Users & Roles** — add/edit/deactivate users, assign ADMIN or CASHIER role; last-admin guard prevents lockout
- 📋 **Audit Log** — every mutation (create/update/delete) logged with actor, before/after JSON snapshots, Arabic summary
- ⚙️ **Settings** — shop info (name, phone, address), database backup & restore (admin-only)
- 🔒 **RBAC** — server-enforced role checks on every mutation; UI controls hidden AND server rejects unauthorized calls
- 🌙 **Dark mode** — light default, toggleable, persisted
- 📱 **Fully responsive** — 360 px → desktop; sidebar collapses to sheet on mobile
- 🌐 **100% offline** — no runtime network calls; all fonts, icons, and assets bundled locally

---

## Architecture

**Monolith — Next.js App Router (no `src/`)**

```
Browser → Next.js (RSC pages fetch data server-side)
       → Server Actions (mutations: validate Zod → check role → write DB → logAudit)
       → Prisma ORM → SQLite file (fe5oo.db at project root)
```

- **Auth:** Auth.js v5 Credentials provider. Username + bcrypt password hash stored in DB. Role embedded in JWT. `middleware.ts` guards all dashboard routes; individual actions call `requireRole('ADMIN')` server-side.
- **Database:** Single SQLite file (`fe5oo.db`) at project root via `@prisma/adapter-libsql`. Migrations via Prisma Migrate. No external DB server.
- **Money:** All prices stored as integer EGP (whole pounds). `formatEGP()` in `lib/money.ts` is the only place formatting happens — never in components.
- **Audit:** Every write (worker/service/ticket/user/setting) calls `logAudit()` inside the same server action. `AuditLog` rows are never deleted.
- **Soft deletes:** Workers, Services, and Users are soft-disabled (`isActive = false`) when referenced by existing tickets — hard delete would orphan history.
- **Backup/Restore:** `/api/backup` streams the raw `.db` file for download (GET) or validates and overwrites it on restore (POST). Admin-only, magic-byte checked.

---

## Project Structure

```
fe5oo/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout: RTL, ThemeProvider, Toaster
│   ├── page.tsx                # Redirect → /overview
│   ├── globals.css             # Tailwind @theme tokens (light + dark)
│   ├── (auth)/
│   │   └── login/page.tsx      # Login screen (only auth page)
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Sidebar + TopBar, session-guarded
│   │   ├── overview/           # Analytics dashboard
│   │   ├── transactions/       # Ticket management
│   │   ├── workers/            # Worker management (admin)
│   │   ├── services/           # Service catalog (admin)
│   │   ├── logs/               # Audit log
│   │   ├── users/              # User & role management (admin)
│   │   ├── settings/           # Shop settings + backup (admin)
│   │   └── profile/            # Change own password (all users)
│   └── api/
│       └── backup/route.ts     # DB download (GET) + restore (POST)
├── actions/                    # Server Actions (Zod-validated, role-checked, audit-logged)
│   ├── tickets.ts
│   ├── workers.ts
│   ├── services.ts
│   ├── users.ts
│   ├── settings.ts
│   ├── profile.ts
│   ├── expenses.ts
│   └── logs.ts
├── components/
│   ├── ui/                     # shadcn primitives
│   ├── shared/                 # AppSidebar, TopBar, DataTable, StatCard, etc.
│   ├── overview/               # OverviewClient (charts)
│   ├── tickets/                # TransactionsClient, TicketForm
│   ├── workers/                # WorkersClient, WorkerForm, ExpenseForm
│   ├── services/               # ServicesClient, ServiceForm
│   ├── users/                  # UsersClient, UserForm
│   ├── logs/                   # LogsClient
│   ├── profile/                # ProfileClient
│   └── settings/               # SettingsClient
├── lib/
│   ├── prisma.ts               # PrismaClient singleton
│   ├── auth.ts                 # session(), requireRole() helpers
│   ├── audit.ts                # logAudit()
│   ├── money.ts                # formatEGP(), parseEGP()
│   ├── period.ts               # resolvePeriod() → {from, to}
│   ├── validators.ts           # All Zod schemas
│   ├── queries/overview.ts     # Overview analytics queries
│   └── utils.ts                # cn(), date helpers
├── prisma/
│   ├── schema.prisma           # Data model
│   ├── seed.ts                 # Roles, users, workers, services, sample tickets
│   └── migrations/             # SQL migration history
├── public/
│   └── fonts/                  # Self-hosted Cairo + IBM Plex Sans Arabic (.woff2 + .ttf)
├── auth.ts                     # Auth.js NextAuth config
├── auth.config.ts              # Auth.js edge-compatible config
├── fe5oo.db                    # SQLite database (gitignored)
├── start.bat                   # Production build + start (Windows)
└── pull.bat                    # git pull current branch (Windows)
```

---

## Quick Start

### Prerequisites

- [Node.js 18+](https://nodejs.org/en/download) — `node --version` to verify
- No internet connection required after `npm install`

### Installation

```bash
git clone git@github.com:YousifMHelal/fe5oo.git
cd fe5oo
npm install
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates fe5oo.db)
npx prisma migrate dev

# Seed with demo data (roles, users, workers, services, 30 sample tickets)
npx tsx prisma/seed.ts
```

### Run (Development)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Run (Production)

```bash
# Windows (one-shot)
start.bat

# Or manually:
npm run build
npm start
```

### Seeded Credentials

| Role    | Username | Password   |
|---------|----------|------------|
| Admin   | `admin`  | `admin123` |
| Cashier | `cashier`| `cashier123` |

> Change both passwords immediately after first login via **Profile → Change Password**.

---

## Environment Variables

Create a `.env` file at the project root (copy the values below):

```env
# SQLite database path (relative to project root)
DATABASE_URL="file:./fe5oo.db"

# Auth.js secret — generate with: openssl rand -base64 32
AUTH_SECRET="your-secret-here"

# Auth.js callback URL — must match your deployment URL
AUTH_URL=http://localhost:3000

# Disable Next.js telemetry
NEXT_TELEMETRY_DISABLED=1
```

Generate a secure `AUTH_SECRET`:
```bash
# Linux/macOS
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations (dev) |
| `npm run db:seed` | Seed database |
| `npm run db:generate` | Regenerate Prisma client |
| `start.bat` | Full production deploy on Windows (install → migrate → build → start) |
| `pull.bat` | `git pull origin <current-branch>` |

---

## RBAC

| Page / Action | Admin | Cashier |
|---------------|:-----:|:-------:|
| View all pages | ✓ | ✓ (read) |
| Create tickets | ✓ | ✓ |
| Change own password | ✓ | ✓ |
| Edit / delete tickets | ✓ | — |
| Manage workers | ✓ | — |
| Manage services | ✓ | — |
| Manage users | ✓ | — |
| View audit logs | ✓ | — |
| Shop settings | ✓ | — |
| Backup / restore DB | ✓ | — |

Role checks are enforced **server-side** on every mutation. UI hiding is secondary — the server rejects unauthorized calls regardless.

---

## Backup & Restore

The entire database is a single file: `fe5oo.db` at the project root.

### Via the UI (Admin → Settings)
- **Download backup:** streams `fe5oo-backup-YYYY-MM-DD.db` to your browser
- **Restore:** upload a `.db` file — validated as SQLite via magic bytes before overwrite

### Manual (command line)
```bash
# Backup
copy fe5oo.db fe5oo-backup-%date:~-4,4%%date:~-10,2%%date:~7,2%.db

# Restore
copy fe5oo-backup-20260627.db fe5oo.db
```

Restart the server after a manual restore.
