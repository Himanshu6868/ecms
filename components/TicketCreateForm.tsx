"use client";

import { useState } from "react";

export function TicketCreateForm() {
  const [status, setStatus] = useState<string | null>(null);

  async function submit(formData: FormData) {
    const payload = {
      description: String(formData.get("description")),
      priority: String(formData.get("priority")),
      location: {
        latitude: Number(formData.get("latitude")),
        longitude: Number(formData.get("longitude")),
        address: String(formData.get("address")),
        zoneId: String(formData.get("zoneId")),
      },
    };

    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as { id?: string; error?: string };
    setStatus(res.ok ? `Created ticket ${json.id ?? ""}` : json.error ?? "Failed to create ticket");
  }

  return (
    <form action={submit} className="space-y-5 rounded-2xl border border-[var(--border-soft)] bg-white p-5 md:p-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          name="description"
          required
          minLength={8}
          className="brand-textarea min-h-28 w-full px-3 py-2.5"
          placeholder="Describe the issue clearly..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <select name="priority" className="brand-select w-full px-3 py-2.5" defaultValue="MEDIUM">
            <option>LOW</option>
            <option>MEDIUM</option>
            <option>HIGH</option>
            <option>CRITICAL</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Zone UUID</label>
          <input name="zoneId" type="text" className="brand-input w-full px-3 py-2.5" required />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Latitude</label>
          <input name="latitude" type="number" step="0.000001" className="brand-input w-full px-3 py-2.5" required />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Longitude</label>
          <input name="longitude" type="number" step="0.000001" className="brand-input w-full px-3 py-2.5" required />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Address</label>
        <input name="address" type="text" className="brand-input w-full px-3 py-2.5" required />
      </div>

      <button className="brand-button rounded-xl px-5 py-2.5" type="submit">
        Submit Ticket
      </button>

      {status ? <p className="text-sm text-[var(--text-muted)]">{status}</p> : null}
    </form>
  );
}
