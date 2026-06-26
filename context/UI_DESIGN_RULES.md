# fe5oo Barbershop — UI Design Rules

Binding visual rules. Every page/component obeys. When building UI, use the **`ui-ux-pro-max` skill** (+ shadcn / 21st.dev MCP) to source proven patterns first — **these rules override any imported snippet** (tokens, RTL, responsive, status semantics). After building a component, run `imprint` → keep `ui-registry.md` so later components match.

---

## 1. Design Direction

**Clean barbershop admin.** Practical, calm, confident — a tool used daily at a busy counter, not a marketing site. Brand identity comes straight from the **fe5oo logo**: black/charcoal, the **barber-pole red and blue**, on white. Red is the hero accent; blue is the secondary/data accent.

- **Light = default** (bright counter, daytime use). **Dark** available via toggle.
- Both themes share the same semantic tokens. **Never hardcode a hex in a component** — use CSS variables / Tailwind theme tokens.
- Data-forward but uncluttered: KPI cards and tables breathe; the numbers are the loudest thing on screen.

---

## 2. Color Tokens (`@theme` / CSS variables in `globals.css`)

Defined once under `:root` (light) and `.dark`. Components reference token names only (`bg-primary`, `text-foreground`, …). Values given as **hex (reference)** + **oklch (authoring)**.

### Brand source (from logo)
- Barber red `#D12A2A` · barber blue `#1E3A8A` · ink/charcoal `#0F1115` · white `#FFFFFF`.

### Light (default)
```
--background:        #F7F7F8   oklch(0.975 0.002 250)
--foreground:        #14161A   oklch(0.21 0.01 260)
--card:              #FFFFFF   oklch(1 0 0)
--card-foreground:   #14161A
--muted:             #EFF0F2   oklch(0.95 0.004 250)
--muted-foreground:  #5B616E   oklch(0.49 0.02 260)
--border:            #E3E5E9   oklch(0.91 0.004 250)
--input:             #E3E5E9
--ring:              #D12A2A   (brand red focus)
--primary:           #C42121   oklch(0.52 0.20 26)    /* barber red — buttons, active nav, key CTAs */
--primary-foreground:#FFFFFF
--secondary:         #1E3A8A   oklch(0.36 0.13 268)   /* barber blue — secondary actions, links, chart series B */
--secondary-foreground:#FFFFFF
--accent:            #F3E9E9   oklch(0.94 0.02 26)    /* soft red tint — hover/selected surfaces */
--accent-foreground: #C42121
```
### Dark
```
--background:        #0F1115   oklch(0.18 0.006 260)
--foreground:        #E7E9EE   oklch(0.92 0.005 260)
--card:              #171A20   oklch(0.22 0.007 260)
--card-foreground:   #E7E9EE
--muted:             #1E222A   oklch(0.26 0.008 260)
--muted-foreground:  #9AA1AE   oklch(0.70 0.02 260)
--border:            #262B34   oklch(0.30 0.008 260)
--input:             #262B34
--ring:              #E8483F
--primary:           #E8483F   oklch(0.64 0.19 27)    /* brighter red for dark contrast */
--primary-foreground:#0F1115
--secondary:         #5B7CD6   oklch(0.62 0.13 268)   /* lifted blue for dark */
--secondary-foreground:#0F1115
--accent:            #241A1B   oklch(0.25 0.03 26)
--accent-foreground: #E8483F
```

### Status / semantic (money & state — consistent everywhere)
Status colors are the **only** colors allowed to carry meaning. No decorative red/green.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--success` | `#15803D` | `#34D399` | revenue up, active worker/service, paid |
| `--warning` | `#B45309` | `#FBBF24` | inactive/disabled, at-attention |
| `--danger`  | `#B91C1C` | `#F87171` | delete, errors, revenue down |

> Note: the brand red (`--primary`) and the danger red are deliberately **different shades** — primary = warm shop red, danger = colder alert red — so a "Save" button never reads as destructive. Destructive buttons use `--danger`.

---

## 3. State = Color + Icon + Text (never color alone)

| State | Color | Icon (lucide) | Arabic label |
|---|---|---|---|
| Active / paid | success | `CheckCircle2` ● | `نشط` / `مدفوع` |
| Inactive / disabled | warning/muted | `Ban` / `PauseCircle` | `موقوف` |
| Deleted / error | danger | `AlertTriangle` ■ | `خطأ` |

One component: `<RoleBadge>` for roles (`مدير` red-tinted, `كاشير` blue-tinted), one `<StatusPill>` for active/inactive. Never bare colored text.

---

## 4. Typography

- **Headings / numbers-hero:** **Cairo** (`--font-heading`) — strong Arabic display face, matches the bold logo wordmark.
- **Body / UI / tables:** **IBM Plex Sans Arabic** (`--font-sans`) — highly legible Arabic at small sizes.
- **Self-hosted** via `next/font/local` from `public/fonts/` (offline — no Google CDN at runtime).
- **Numerals:** `font-variant-numeric: tabular-nums` on all money/metric cells. Use **Western digits (0–9)** for money so columns align and EGP totals are scannable (Arabic-Indic digits are visually fine but break tabular alignment in tables — keep Western in data, Arabic copy in labels).
- **Scale (no sizes off-scale):** `text-xs` meta/labels · `text-sm` body/table · `text-base` · `text-lg` card/section titles · `text-2xl`/`text-3xl` hero KPI number.
- KPI card title: `text-sm font-medium text-muted-foreground`. Hero number: `text-3xl font-bold tabular-nums`. Let the data shout, labels stay quiet.

---

## 5. Spacing & Layout

- **4px base grid.** Tailwind spacing only (`gap-2/3/4/6`, `p-4/6`). No magic pixel values.
- **Card:** `rounded-xl border bg-card p-4 md:p-6`; subtle shadow in light, border-only in dark.
- **Page padding:** `p-4 md:p-6 lg:p-8`.
- **Sidebar:** 256px rail (`w-64`) on `lg+`, collapsible to 64px. **Top bar:** 56px (`h-14`).
- **Overview KPI grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.
- **Max content width:** `max-w-screen-2xl` centered; tables/charts go full width within.

---

## 5b. Responsive — Mandatory

Every page and component is fully responsive. Verify at **360px**, 768px, 1024px, 1440px before marking any UI task done. Mobile-first (base = mobile, layer `md:`/`lg:`). RTL **and** responsive must both hold at every breakpoint.

- **Sidebar:** rail on `lg+`; hamburger → shadcn `Sheet` drawer below `lg`. Never two nav patterns at once.
- **Top bar:** period filter + theme + account stay reachable on mobile; collapse extras into a menu. No horizontal overflow.
- **KPI cards:** `grid-cols-1` → `sm:grid-cols-2` → `lg:grid-cols-4`.
- **Tables (transactions, workers, services, users, logs):** never force a desktop table on a phone. Horizontal scroll inside a bordered container **or** stacked card rows below `md`. Keep search/sort reachable. Use `overflow-x-auto` + `min-w-0`.
- **Charts:** Recharts `ResponsiveContainer`, `min-height` so they never collapse, fewer ticks on small screens.
- **Touch:** all interactive targets ≥ 44px. Hover-only affordances need a tap equivalent.

---

## 6. Component Anatomy

**KPI / StatCard**
```
StatCard
├── label (text-sm muted)  ·  optional period chip
├── value (text-3xl bold tabular-nums)  + unit "ج.م"
└── delta (success/danger, arrow icon + %) — optional
```
**Page header** (every dashboard page): title (`text-lg font-semibold`) at start · primary action button (e.g. "إضافة عامل") at end · period filter where relevant.

**DataTable** (shared): sticky header, hover row highlight, sortable headers (mirrored arrow in RTL), search input top-**start**, primary action / export top-**end**, dense rows (`py-2`), tabular numerals, row actions (edit/delete) in an end-aligned menu, `<StatusPill>` cells — never bare colored text.

**Forms** (WorkerForm/ServiceForm/UserForm/TicketForm): react-hook-form + zod, labels above inputs, inline Arabic error under the field, submit disabled while pending, success → sonner toast + close dialog/refresh.

**Destructive actions:** always a `<ConfirmDialog>` (`--danger` button), never a bare click. Never a casual toggle for delete.

---

## 7. RTL Rules (non-negotiable)

- **Logical properties ONLY:** `ps-/pe-`, `ms-/me-`, `start-/end-`, `text-start/text-end`. Never `pl/pr/ml/mr/left/right`.
- Directional icons (chevrons, arrows, trend axis, back) **mirror** in RTL.
- Charts: time axis flows **right → left**; bar/line read RTL.
- Latin/number data stays LTR inside RTL text (`dir="ltr"` span on money/IDs/dates as needed) so `120 ج.م` and dates don't reverse.
- `<html dir="rtl" lang="ar">` set at the root.

---

## 8. Charts (Recharts via shadcn `ChartContainer`)

- Always use shadcn `ChartContainer` + `chartConfig` so colors come from tokens, not hardcoded.
- **Earnings-per-worker:** vertical/horizontal **bar**, single series in `--primary` (red), value labels, sorted desc.
- **Revenue trend (period):** **line/area**, 2px stroke `--secondary` (blue), no dots unless interactive, RTL time axis, EGP-formatted tooltip.
- **Top services:** horizontal bar (by revenue) — primary red ramp; or donut if proportion is the point.
- Tooltips show exact `formatEGP` value. Tabular numerals. Empty-state when no data in the period.
- Decorative gradients OK in chart fills but **never** repurpose `--success/--warning/--danger` for non-status series.

---

## 9. Tables

Covered in §6 (DataTable) — reiterate the hard ones: status via `<StatusPill>`, money via `<MoneyCell>` (tabular, EGP), row expand for ticket line-items (chevron mirrors in RTL), search top-start / actions top-end, responsive scroll-or-stack below `md`.

---

## 10. Interaction & Motion

- Transitions ≤150ms, ease-out. Respect `prefers-reduced-motion`.
- Hover = tint/elevate, **never** layout shift. `cursor-pointer` on all clickable elements.
- Filter/period change updates the URL; show subtle loading, not a full-page flash.
- Visible `focus-visible` ring (`--ring`, brand red) for keyboard nav.

---

## 11. Iconography

- `lucide-react` only (bundled). 16/20px in UI, 24px for emphasis. No emoji as icons.
- Sidebar icons: Overview = `LayoutDashboard` · Transactions = `ReceiptText` · Workers = `Scissors` · Services = `Tags` · Logs = `ScrollText` · Users = `UsersRound` · Settings = `Settings` · Profile = `UserCog`.

---

## 12. Do / Don't

✅ Use `ui-ux-pro-max` + shadcn MCP for UI. ✅ Light default + dark, both via tokens. ✅ Fully responsive, test at 360px. ✅ Logical CSS props (RTL). ✅ Integer EGP via `formatEGP`, tabular numerals. ✅ One `DataTable`, one `StatusPill`, one `ConfirmDialog`, one `StatCard`. ✅ Brand red `--primary` for CTAs, separate `--danger` for destructive. ✅ Loading/empty/error states.

❌ Desktop-only layouts. ❌ Hardcoded hex in components. ❌ `pl/pr/ml/mr/left/right`. ❌ Font sizes/colors off-token. ❌ Color-only status. ❌ Primary-red button doubling as a delete button. ❌ Float money or per-component formatting. ❌ Google-CDN fonts at runtime (offline). ❌ Bare-click destructive actions.
