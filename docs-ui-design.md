# ECMS UI/UX Design Blueprint (Light Green + White)

## Global Design Language

- **Primary brand color:** `#A3D9A5`
- **Primary background:** `#FFFFFF`
- **Soft background:** `#F6FBF6`
- **Borders:** `#DDEBDD`
- **Text:** `#1F2937` (primary), `#4B5563` (secondary)
- **Button hover:** `#8BCB8E`

### Shared component standards

- **Buttons:** 10–12px radius, semibold label, subtle lift on hover
- **Inputs:** 10–12px radius, 1px soft border, 4px green focus ring
- **Cards/Surfaces:** white panel + gentle shadow + soft green border
- **Spacing scale:** 4, 8, 12, 16, 24, 32
- **Typography:** Inter / system sans; clear hierarchy

---

## 1) Login Page

### Layout description

- Desktop split layout (`2 columns`):
  - Left: brand value proposition and feature chips
  - Right: authentication card
- Tablet and below: stacks into single-column flow with form prioritized.

### Component overview

- Branding card with heading/subheading and three capability chips.
- Login card with:
  - Email field
  - OTP request button
  - OTP input
  - Primary sign-in CTA
  - Inline status/validation message

### Color usage

- Page base: white to very soft green gradient (`#FFFFFF` → `#F6FBF6`).
- Form card: white, soft border (`#DDEBDD`).
- Primary CTA: `#A3D9A5`, hover `#8BCB8E`.
- Focus ring: translucent `#A3D9A5`.

### Typography and spacing

- Hero title: 36–48px desktop, 30px tablet.
- Form title: 24–30px.
- Labels/body: 14–16px.
- Vertical spacing: 16–24px.

### Interaction / UX details

- Focus-visible input ring for keyboard users.
- OTP status shown inline in a clearly separated message block.
- Buttons sized for touch and pointer interaction.
- Logical tab order (email → request otp → otp → sign in).

### Tailwind snippet

```tsx
<main className="grid min-h-screen lg:grid-cols-2 bg-gradient-to-br from-white to-[#F6FBF6]">
  <section className="surface p-8">Brand content</section>
  <section className="surface-3d p-8 max-w-lg mx-auto">Auth form</section>
</main>
```

---

## 2) Ticket Creation Page

### Layout description

- Primary content uses responsive two-panel layout:
  - Left: full ticket form
  - Right: contextual guidance cards (tips + SLA)
- On tablet: collapses to single column with form first.

### Component overview

- Page header (status chip, title, helper text).
- Ticket form card:
  - Description textarea
  - Priority select
  - Zone UUID
  - Latitude/Longitude
  - Address
  - Action row: Save Draft + Submit Ticket
- Sidebar guidance cards for better form quality.

### Color usage

- Form and guidance cards remain white with green border lines.
- Priority/select/input interactions use same green focus ring.
- Primary submit button uses `#A3D9A5`, secondary remains white.

### Typography and spacing

- Page title: 30–36px.
- Section labels: 14px medium.
- Inputs: consistent ~40px+ touch target.
- Grid gap: 20–24px desktop, ~16px tablet.

### Interaction / UX details

- Large description box for complete context capture.
- Clear status message after submission.
- Balanced action hierarchy: secondary "Save Draft" + primary "Submit".
- Layout keeps guidance visible without interrupting form completion.

### Tailwind snippet

```tsx
<section className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
  <form className="surface-3d p-6 space-y-5">...</form>
  <aside className="space-y-4">
    <article className="surface p-4">Submission tips</article>
  </aside>
</section>
```

---

## 3) Admin Dashboard Page

### Layout description

- Persistent sidebar (desktop) + compact top nav (mobile/tablet).
- Content stack:
  1. Overview heading
  2. KPI cards row
  3. Filter controls
  4. Ticket status table with progress bars

### Component overview

- Left navigation for Dashboard / Create Ticket / Admin.
- KPI cards: Total Tickets, Open Tickets, Total Users, Status Buckets.
- Filter toolbar buttons (date range, status, assignee).
- Analytics table with status counts and progress meter.

### Color usage

- Sidebar and cards are white; active/hover states use green tint.
- Table header uses light green background (`#EEF8EE`).
- Progress bars use brand green fills (`#A3D9A5`).

### Typography and spacing

- Dashboard heading: 32–36px desktop.
- KPI values: 32px emphasis.
- Table text: 14px with comfortable row padding.
- Section separation: ~24px.

### Interaction / UX details

- Large filter controls for quick operations.
- Table rows have clear row separation and visual scanability.
- Progress bars help compare status distribution at a glance.
- Responsive card grid scales from 4-up desktop to 2-up tablet.

### Tailwind snippet

```tsx
<section className="surface p-5 space-y-4">
  <div className="flex flex-wrap gap-2">filters...</div>
  <div className="overflow-hidden rounded-xl border border-[#DDEBDD]">
    <table className="w-full text-sm">
      <thead className="bg-[#EEF8EE]">...</thead>
    </table>
  </div>
</section>
```
