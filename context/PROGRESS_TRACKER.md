# fe5oo Barbershop — Progress Tracker

Single source of truth for "what's done". The agent MUST update this after finishing any task, and tick the matching box in `BUILD_PLAN.md`.

Status: `TODO` · `IN PROGRESS` · `DONE` · `BLOCKED`

Last updated: 2026-06-24 — *Phase 0 + Phase 1 complete.*

---

## Phase Summary

| Phase | Title | Status | Notes |
|---|---|---|---|
| 0 | Scaffold & Foundations | DONE | Next.js 16/Tailwind v4/shadcn/Auth.js v5/RTL |
| 1 | Data Model & Seed | DONE | Prisma 7 + libsql adapter, seed verified |
| 2 | App Shell | TODO | |
| 3 | Services (CRUD) | TODO | proves CRUD pattern |
| 4 | Workers (CRUD) | TODO | |
| 5 | Transactions | TODO | cashier core |
| 6 | Overview (analytics) | TODO | |
| 7 | Users & Roles | TODO | |
| 8 | Logs / Profile / Settings / Backup | TODO | |
| 9 | Hardening & Production-Ready | TODO | |
| 10 | Polish | TODO | |

---

## Task Detail

### Phase 0 — Scaffold
| ID | Task | Status |
|---|---|---|
| P0-1 | Init Next.js (no src) + Tailwind v4 + RTL root | DONE |
| P0-2 | shadcn init + base primitives | DONE |
| P0-3 | next-themes (light default) + token sets | DONE |
| P0-4 | Self-host Cairo + IBM Plex Sans Arabic | DONE |
| P0-5 | Prisma + SQLite + lib stubs | DONE |
| P0-6 | Auth.js Credentials + RBAC + /login | DONE |

### Phase 1 — Data
| ID | Task | Status |
|---|---|---|
| P1-1 | Full schema.prisma | DONE |
| P1-2 | Migrate | DONE |
| P1-3 | audit/money/period libs | DONE |
| P1-4 | seed.ts (roles, users, workers, services, tickets) | DONE |
| P1-5 | Run seed + verify | DONE |

### Phase 2 — Shell
| ID | Task | Status |
|---|---|---|
| P2-1 | (dashboard)/layout + session guard | TODO |
| P2-2 | AppSidebar (role-filtered, responsive) | TODO |
| P2-3 | TopBar (period, theme, account) | TODO |
| P2-4 | Shared primitives (StatCard/DataTable/etc.) | TODO |
| P2-5 | / → role-based redirect | DONE |

### Phase 3 — Services
| ID | Task | Status |
|---|---|---|
| P3-1 | service schema + actions (audited) | TODO |
| P3-2 | /services DataTable | TODO |
| P3-3 | ServiceForm + delete confirm | TODO |

### Phase 4 — Workers
| ID | Task | Status |
|---|---|---|
| P4-1 | worker actions (audited) | TODO |
| P4-2 | /workers DataTable | TODO |
| P4-3 | WorkerForm + delete confirm | TODO |

### Phase 5 — Transactions
| ID | Task | Status |
|---|---|---|
| P5-1 | ticket actions (priceSnapshot, total, RBAC) | TODO |
| P5-2 | /transactions table + line-item expand | TODO |
| P5-3 | TicketForm (multi line-item, cashier+admin) | TODO |
| P5-4 | edit/delete admin-only | TODO |

### Phase 6 — Overview
| ID | Task | Status |
|---|---|---|
| P6-1 | overview queries (period-filtered) | TODO |
| P6-2 | KPI cards | TODO |
| P6-3 | earnings-per-worker bar | TODO |
| P6-4 | revenue trend + top services | TODO |
| P6-5 | wire period filter + empty states | TODO |

### Phase 7 — Users & Roles
| ID | Task | Status |
|---|---|---|
| P7-1 | user actions (bcrypt, deactivate, last-admin guard) | TODO |
| P7-2 | /users DataTable | TODO |
| P7-3 | UserForm (role from DB) | TODO |

### Phase 8 — Logs / Profile / Settings / Backup
| ID | Task | Status |
|---|---|---|
| P8-1 | /logs audit table + before/after expand | TODO |
| P8-2 | /profile change password | TODO |
| P8-3 | /settings shop info | TODO |
| P8-4 | backup/restore SQLite (admin) | TODO |

### Phase 9 — Hardening
| ID | Task | Status |
|---|---|---|
| P9-1 | loading/error/empty states | TODO |
| P9-2 | RBAC server-side audit | TODO |
| P9-3 | RTL pass | TODO |
| P9-4 | Responsive pass | TODO |
| P9-5 | Money audit | TODO |
| P9-6 | Accessibility | TODO |
| P9-7 | Offline audit | TODO |
| P9-8 | README | TODO |

### Phase 10 — Polish
| ID | Task | Status |
|---|---|---|
| P10-1 | ui-ux-pro-max review pass | TODO |
| P10-2 | Micro-interactions | TODO |
| P10-3 | Visual consistency (ui-registry) | TODO |
| P10-4 | Polished states | TODO |
| P10-5 | Chart polish | TODO |
| P10-6 | Light/dark parity | TODO |
| P10-7 | RTL polish | TODO |
| P10-8 | Login/shell/nav polish | TODO |
| P10-9 | Final device walkthrough (×themes ×roles) | TODO |

---

## Changelog (newest first)
- **2026-06-24** — Phase 0 + Phase 1 complete. Key discoveries: Next.js 16 renamed `middleware.ts` → `proxy.ts`; Prisma 7 requires `accelerateUrl` or `adapter` (no datasource URL in schema — moved to `prisma.config.ts`); DB lives at repo root `fe5oo.db` (not in `prisma/`); Auth.js v5 needs edge-safe `auth.config.ts` split for proxy to avoid Node.js modules in edge runtime. Seed verified: 2 roles, 2 users, 6 workers, 8 services, 30 tickets.
- **2026-06-24 (clarifications)** — User added two rules after initial docs: (1) **fully responsive** promoted to hard non-negotiable (ARCHITECTURE §8 #11, AGENTS #11); (2) **cashier reads every page, writes tickets only** (+ own password) — sidebar shows all pages to both roles, write controls gated per-page (ARCHITECTURE §4/§6/§8 #6, AGENTS #6, BUILD_PLAN P2-2/P5/P9-2). Note: AGENTS.md had to be rewritten — earlier write didn't persist.
- **2026-06-24** — Ran project-architect discovery interview + created the six context docs (ARCHITECTURE, UI_DESIGN_RULES, BUILD_PLAN, PROGRESS_TRACKER, MEMORY, AGENTS). Locked: Next.js 15 + Prisma + SQLite + shadcn + Tailwind v4 + Zod + Auth.js; Arabic-only RTL; light default + dark; integer EGP; Ticket+TicketItem with priceSnapshot; ADMIN/CASHIER RBAC; offline-only with DB backup/restore; brand red+blue palette from logo. No application code written yet.
