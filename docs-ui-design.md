# Modern Light Green + White Interface Proposal

## Shared Design System

- **Primary color:** `#A3D9A5` (light green)
- **Background:** `#FFFFFF`
- **Surface alt:** `#F6FBF6`
- **Text primary:** `#1F2937`
- **Text secondary:** `#4B5563`
- **Border:** `#DDEBDD`
- **Success:** `#2E7D32`
- **Error:** `#C62828`

### Core component tokens

- **Radius:** 12px (cards), 10px (inputs/buttons)
- **Shadow:** `0 6px 20px rgba(31,41,55,0.08)`
- **Spacing scale:** 4, 8, 12, 16, 24, 32
- **Typography:** Inter / system sans

---

## 1) Login Page

### Layout description

- Centered split layout on desktop (`40/60`): left side branding/illustration, right side login card.
- Tablet collapses to single-column with branding banner on top and form below.
- Vertical rhythm with 24px spacing between sections.

### Component overview

- Top-left logo and app name.
- Login card includes: title, subtitle, email field, password field, remember me, forgot link, sign-in button.
- Optional SSO button and divider.
- Footer with support/contact link.

### Color usage

- App background white.
- Branding panel uses a subtle gradient from `#FFFFFF` to `#F6FBF6`.
- Primary button and focused input ring use `#A3D9A5`.
- Hover state for button darkens to `#8BCB8E`.
- Error text/border in red with accessible contrast.

### Typography and spacing

- H1: 28/32 semibold.
- Form labels: 14/20 medium.
- Body/help text: 14/20 regular.
- Form stack gap: 16px, section gap: 24px.

### Interaction/UX details

- Visible focus ring: 2px green outline + 2px offset.
- Inline validation below each field.
- Disable submit and show spinner during auth request.
- Keyboard-first flow: Enter submits, tab order logical.

### Tailwind snippet (key section)

```tsx
<div className="min-h-screen grid md:grid-cols-2 bg-white">
  <aside className="hidden md:flex items-center justify-center bg-gradient-to-br from-white to-[#F6FBF6] p-10">
    <div className="max-w-sm">
      <h1 className="text-3xl font-semibold text-gray-800">Support Portal</h1>
      <p className="mt-3 text-gray-600">Track, create, and resolve tickets faster.</p>
    </div>
  </aside>

  <main className="flex items-center justify-center p-6 md:p-12">
    <form className="w-full max-w-md bg-white border border-[#DDEBDD] rounded-xl shadow-[0_6px_20px_rgba(31,41,55,0.08)] p-6 space-y-4">
      <input className="w-full rounded-lg border border-[#DDEBDD] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A3D9A5]" />
      <button className="w-full rounded-lg bg-[#A3D9A5] hover:bg-[#8BCB8E] text-gray-900 font-medium py-2.5">Sign in</button>
    </form>
  </main>
</div>
```

---

## 2) Ticket Creation Page

### Layout description

- Dashboard shell with top navbar + optional left sidebar.
- Main area uses a two-column grid on desktop:
  - Left (8 cols): ticket form
  - Right (4 cols): tips/SLA/preview panel
- Tablet collapses to single column.

### Component overview

- Navbar: search, notifications, user avatar.
- Form card fields: title, category, priority, description, attachments, requester info.
- Sticky action bar: Save Draft + Submit Ticket.
- Right panel cards: SLA hints, examples, recent similar tickets.

### Color usage

- Form surfaces white with green-tinted borders.
- Priority chips use neutral base with green highlight for selected.
- Primary CTA uses `#A3D9A5`; secondary button white with green border.
- Drag-drop attachment area uses `#F6FBF6` background + dashed green border.

### Typography and spacing

- Page title: 24/30 semibold.
- Section headings: 16/24 semibold.
- Inputs and selects: min height 40px.
- Grid gap: 24px desktop, 16px tablet.

### Interaction/UX details

- Autosave indicator (e.g., “Saved 10s ago”).
- Character counter for description.
- Real-time validation with clear message tone.
- Preserve entered data on refresh/navigation warning.

### Tailwind snippet (key section)

```tsx
<section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
  <form className="xl:col-span-8 bg-white border border-[#DDEBDD] rounded-xl p-6 space-y-5">
    <div className="grid md:grid-cols-2 gap-4">
      <input placeholder="Ticket title" className="rounded-lg border border-[#DDEBDD] px-3 py-2 focus:ring-2 focus:ring-[#A3D9A5]" />
      <select className="rounded-lg border border-[#DDEBDD] px-3 py-2 focus:ring-2 focus:ring-[#A3D9A5]" />
    </div>
    <textarea className="w-full min-h-40 rounded-lg border border-[#DDEBDD] px-3 py-2 focus:ring-2 focus:ring-[#A3D9A5]" />
    <div className="flex gap-3 justify-end">
      <button className="px-4 py-2 rounded-lg border border-[#A3D9A5]">Save draft</button>
      <button className="px-4 py-2 rounded-lg bg-[#A3D9A5] hover:bg-[#8BCB8E]">Submit ticket</button>
    </div>
  </form>

  <aside className="xl:col-span-4 space-y-4">
    <div className="bg-[#F6FBF6] border border-[#DDEBDD] rounded-xl p-4">SLA guidance</div>
  </aside>
</section>
```

---

## 3) Admin Dashboard Page

### Layout description

- Desktop: persistent left sidebar + top navbar + content canvas.
- Content hierarchy:
  1. KPI cards row
  2. Charts row (ticket volume, resolution time)
  3. Ticket management table
- Tablet: collapsible sidebar drawer, cards in 2-up layout.

### Component overview

- Sidebar navigation with active state indicator.
- KPI cards: Open, In Progress, Overdue, Resolved.
- Filter toolbar: date range, status, assignee, search.
- Data table with sortable columns, status badges, row actions.
- Optional right drawer for quick ticket detail.

### Color usage

- Sidebar white with green active item background tint.
- KPI card accents (top border or icon background) in `#A3D9A5`.
- Table header with very light green tint (`#F6FBF6`).
- Status badges keep semantic colors, but neutral badges use green family.

### Typography and spacing

- Dashboard heading: 26/32 semibold.
- KPI values: 28/32 bold.
- Table text: 14/20.
- Section spacing: 24px; card internal padding: 16–20px.

### Interaction/UX details

- Sticky table header for long lists.
- Hover row highlight and clear selected state.
- Sort icons and filter chips with keyboard accessibility.
- Empty/loading states with skeleton loaders.

### Tailwind snippet (key section)

```tsx
<div className="min-h-screen bg-[#F6FBF6] grid lg:grid-cols-[240px_1fr]">
  <aside className="bg-white border-r border-[#DDEBDD] p-4">
    <nav className="space-y-1">
      <a className="block px-3 py-2 rounded-lg bg-[#EAF6EA] text-gray-900 font-medium">Dashboard</a>
    </nav>
  </aside>

  <main className="p-6 space-y-6">
    <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <article className="bg-white border border-[#DDEBDD] rounded-xl p-4">
        <p className="text-sm text-gray-600">Open Tickets</p>
        <p className="text-2xl font-bold text-gray-900">128</p>
      </article>
    </section>

    <section className="bg-white border border-[#DDEBDD] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#F6FBF6] text-gray-700">
          <tr><th className="text-left px-4 py-3">Ticket</th></tr>
        </thead>
      </table>
    </section>
  </main>
</div>
```
