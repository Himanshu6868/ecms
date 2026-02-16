# ECMS Enterprise UI Redesign Spec

## A) Design system specification

### 1) Typography scale (token-driven)

| Token | Size / line-height | Usage |
| --- | --- | --- |
| `text-display` | `clamp(2rem, 3vw, 3rem) / 1.1` | Login hero, key page headings |
| `text-h1` | `2rem / 1.15` | Page titles |
| `text-h2` | `1.5rem / 1.25` | Card titles, section headers |
| `text-h3` | `1.125rem / 1.35` | Subsections |
| `text-body` | `0.95rem / 1.5` | Standard content |
| `text-caption` | `0.8rem / 1.4` | Metadata, chips |

### 2) Spacing scale

- `space-1 = 4px`
- `space-2 = 8px`
- `space-3 = 12px`
- `space-4 = 16px`
- `space-5 = 20px`
- `space-6 = 24px`
- `space-8 = 32px`
- `space-10 = 40px`

### 3) Border radius scale

- `--radius-sm: 8px`
- `--radius-md: 12px`
- `--radius-lg: 16px`
- `--radius-xl: 20px`

### 4) Shadow scale

- `--shadow-xs`: low elevation for inputs
- `--shadow-sm`: cards and app shell surfaces
- `--shadow-md`: hero cards/modals

### 5) Semantic color tokens (AA-safe foreground pairings)

- **Brand:** `#A3D9A5` / hover `#8BCB8E`
- **Text primary:** `#1F2937`
- **Text secondary:** `#4B5563`
- **Success:** bg `#E8F7EA`, fg `#1F7A3D`
- **Warning:** bg `#FFF5DC`, fg `#9A6700`
- **Error:** bg `#FEECEB`, fg `#B42318`
- **Info:** bg `#EAF2FF`, fg `#1D4ED8`
- **Surface layers:** `--surface-0` → `--surface-3` from background to nested cards

### 6) Interaction states

- **Hover:** subtle lift + tint (`hover:bg-brand-50`, translateY)
- **Focus:** 2px outline + 4px soft focus ring (`focus-visible:ring-brand-100`)
- **Disabled:** `opacity-50~55` and pointer lock
- **Loading:** text change + spinner/skeleton when applicable

---

## B) IA & layout upgrades

### Login flow
- Clear split-layout: trust messaging on left, action card on right.
- Two explicit flow cards reduce wrong-path sign-in.
- Internal/external pages now include policy + security guidance.

### Dashboard
- Structured as: header → KPI strip → filter bar → queue table.
- Added reusable KPI cards and normalized top spacing.
- Role visibility remains intact while improving scan speed.

### Ticket creation page
- Reduced visual noise with one primary form card and muted guidance cards.
- Clear form hierarchy (description → priority/location → actions).
- SLA guidance preserved in right rail.

### Internal ticket board table
- Improved table legibility: stronger header contrast, quieter row backgrounds.
- Queue tabs placed in a compact segmented control.
- Added explicit empty-state.

### Admin cockpit analytics
- KPI cards upgraded with icons and contextual trend text.
- Filter toolbar standardized via reusable filter bar component.
- Added skeleton + empty-state fallback when analytics is unavailable.

---

## C) Component-level improvements

### App shell (sidebar/topbar)
- New `AppShellNav` with icon-led navigation and consistent hover/focus behavior.

### KPI cards
- New `KpiCard` component with tokenized surfaces and icon affordances.

### Filter bar
- New `FilterBar` with integrated search field and action slots.

### Data table
- Reduced clutter: cleaner headers, lighter row borders, compact action controls.

### Empty states, skeletons, toasts
- New reusable `EmptyState`, `Skeleton`, and `InlineToast` components.
- Applied to ticket table, internal board, admin cockpit, auth, and ticket creation.

---

## D) Implementation patterns + before/after examples

### Tailwind class patterns

- **Primary card:** `surface p-5 md:p-6`
- **Nested card:** `surface-muted p-4`
- **Primary CTA:** `btn-brand`
- **Secondary CTA:** `btn-muted`
- **Accessible input:** `focus-visible:ring-4 focus-visible:ring-brand-100 focus-visible:border-brand-600`
- **Dense table row:** `border-t border-brand-100 hover:bg-brand-50/70`

### Before/After #1: Auth status message

**Before**
```tsx
{status ? <p className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-soft">{status}</p> : null}
```

**After**
```tsx
{status ? <InlineToast message={status} tone={statusTone} /> : null}
```

### Before/After #2: KPI metric block

**Before**
```tsx
<HoverLift className="surface-3d p-4">
  <p className="text-soft text-xs uppercase">Open Workload</p>
  <p className="mt-2 text-2xl font-semibold">{openCount}</p>
</HoverLift>
```

**After**
```tsx
<KpiCard
  label="Open workload"
  value={openCount}
  trend="Active operational demand"
  icon={FolderOpen}
/>
```

### Before/After #3: Empty table state

**Before**
```tsx
<section className="surface-3d p-5">
  <p className="text-soft text-sm">No tickets yet. Create one from the New Ticket page.</p>
</section>
```

**After**
```tsx
<EmptyState
  title="No tickets found"
  description="You have no active tickets in this scope. Create a new ticket to begin escalation tracking."
/>
```

### Phased migration plan

#### Week 1 (quick wins)
1. Deploy token refresh in `globals.css` and update base form controls.
2. Ship app shell/nav, KPI cards, and filter bar.
3. Apply empty states and inline toast patterns to primary flows.

#### Weeks 2–3 (medium phase)
1. Migrate remaining forms/tables to shared primitives.
2. Add real filter functionality + persisted table preferences.
3. Expand skeleton/loading states and add visual regression checks.

---

## E) UX rationale (trust, readability, conversion/speed)

- **Trust:** cleaner shell, explicit role pathways, and stronger status feedback reduce ambiguity.
- **Readability:** typographic hierarchy and lower-noise surfaces improve scanability in dense screens.
- **Task speed:** KPI-first layouts and consistent filter/table structures shorten time-to-action for operators.
- **Accessibility:** focus rings, safer color pairings, and consistent state treatment improve keyboard and low-vision usability.
- **Scalability:** token-driven components reduce UI drift and make future feature work faster.
