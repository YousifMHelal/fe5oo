# fe5oo BARBERSHOP

Arabic-only RTL barbershop management dashboard. Fully offline, no CDN, no telemetry.

## Stack

- Next.js 16 (App Router) · TypeScript strict · Tailwind v4 · shadcn/ui
- Prisma 7 + SQLite (local file) · Auth.js v5 · Recharts · TanStack Table
- Fonts: Cairo + IBM Plex Sans Arabic (self-hosted in `public/fonts/`)

## Prerequisites

- Node.js 18+
- No internet connection required after `npm install`

## Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with demo data
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

Open http://localhost:3000

## Seeded Credentials

| Role   | Username  | Password    |
|--------|-----------|-------------|
| Admin  | admin     | admin123    |
| Cashier| cashier   | cashier123  |

## Production Build

```bash
npm run build
npm start
```

## Backup & Restore

The database is a single file at `fe5oo.db` in the project root.

**Via the UI (Admin → Settings):**
- Download: streams the `.db` file as a binary attachment
- Restore: upload a `.db` file — validated as SQLite, then written to disk

**Manual backup:**
```bash
cp fe5oo.db fe5oo-backup-$(date +%Y%m%d).db
```

**Manual restore:**
```bash
cp fe5oo-backup-20240101.db fe5oo.db
```

Restart the server after a manual restore.

## RBAC

| Feature | Admin | Cashier |
|---------|-------|---------|
| View all pages | ✓ | ✓ |
| Create tickets | ✓ | ✓ |
| Change own password | ✓ | ✓ |
| Manage services, workers, users | ✓ | — |
| Delete tickets | ✓ | — |
| View audit logs | ✓ | — |
| Shop settings + backup | ✓ | — |

## Offline

No external network calls at runtime. All fonts, icons, and UI assets are bundled locally.
Set `NEXT_TELEMETRY_DISABLED=1` (already in `.env`) to suppress Next.js telemetry.
