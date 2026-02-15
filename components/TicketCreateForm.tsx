"use client";

import { useState } from "react";
import { FadeIn, HoverLift } from "@/components/ui/motion";

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
    <HoverLift className="surface-3d p-4 md:p-6">
      <FadeIn>
        <form action={submit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Issue description</label>
            <textarea name="description" required minLength={8} className="input-clean min-h-28" placeholder="Describe the issue, impact, and any immediate workaround." />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Priority</label>
              <select name="priority" className="input-clean" defaultValue="MEDIUM">
                <option>LOW</option>
                <option>MEDIUM</option>
                <option>HIGH</option>
                <option>CRITICAL</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Zone UUID</label>
              <input name="zoneId" type="text" className="input-clean" required placeholder="Area mapping id" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Latitude</label>
              <input name="latitude" type="number" step="0.000001" className="input-clean" required />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Longitude</label>
              <input name="longitude" type="number" step="0.000001" className="input-clean" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Address</label>
            <input name="address" type="text" className="input-clean" required placeholder="Street, city, landmark" />
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button className="btn-muted" type="button">
              Save Draft
            </button>
            <button className="btn-brand" type="submit">
              Submit Ticket
            </button>
          </div>

          {status ? <p className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-soft">{status}</p> : null}
        </form>
      </FadeIn>
    </HoverLift>
  );
}
