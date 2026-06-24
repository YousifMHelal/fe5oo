# fe5oo Barbershop — Agent Operating Guide

Read this first, every session. It is the contract for working this repo.

## Read order (session start)
1. `context/AGENTS.md` (this file) — the rules.
2. `context/ARCHITECTURE.md` — scope, stack, data model, non-negotiables.
3. `context/MEMORY.md` — locked decisions + why, technical discoveries.
4. `context/BUILD_PLAN.md` — pick the next unblocked task.
5. `context/UI_DESIGN_RULES.md` — before any UI work.
6. `context/PROGRESS_TRACKER.md` — current state of every task.

## Hard rules (never break — from ARCHITECTURE §8)
1. **Offline only** — zero runtime network calls. Self-host fonts; bundle icons/assets; DB + backups stay inside the project folder. No CDN, no telemetry.
2. **`app/` at repo root, no `src/`.**
3. **Money is integer EGP** everywhere — no floats, format only via `formatEGP`.
4. **Every mutation = a Zod-validated server action that role-checks server-side, then writes, then calls `logAudit()`.** Never trust the client.
5. **Strict catalog pricing** — server copies `Service.price` → `TicketItem.priceSnapshot` at create. Cashier never sets/edits price.
6. **RBAC on the server**, not just hidden in UI. Cashier = **read every page**, write only = create-ticket + change-own-password. Every other mutation is ADMIN-only and server-rejected.
7. **No hardcoded hex in components** — design tokens only.
8. **RTL-safe** — logical CSS props only (`ps/pe/ms/me/start/end`), never `pl/pr/ml/mr/left/right`.
9. **Don't hard-delete** referenced Workers/Services/Users — soft-disable (`isActive`).
10. **All UI via the `ui-ux-pro-max` skill**; project design rules override imported snippets.
11. **Fully responsive** — every page/component at 360px → desktop. Not desktop-only. Verify mobile/tablet/desktop before marking any UI task done.

## Workflow (every task)
1. Pick the next unblocked task from `BUILD_PLAN.md` (respect phase order + Exit criteria).
2. Build to the standard in `ARCHITECTURE.md` + `UI_DESIGN_RULES.md`.
3. Tick the box in `BUILD_PLAN.md` **and** set the task DONE in `PROGRESS_TRACKER.md` with a changelog entry.
4. Log any non-obvious decision or surprise in `MEMORY.md` (decision + rationale / discovery).
5. Don't start a phase before its predecessor's blocking tasks are done.

## Tooling mandates
- **UI:** `ui-ux-pro-max` skill (+ shadcn MCP) for every component/page. After building, run `imprint` → update `ui-registry.md` so later components match.
- **Library APIs:** confirm current syntax with `find-docs` / `ctx7` before coding — especially Prisma+SQLite, Auth.js v5, Tailwind v4, `next/font/local`. Don't rely on memory.
- **Docs:** keep all six `context/` files in sync — they are one system.

Keep this file short. It is a checklist, not an essay.
