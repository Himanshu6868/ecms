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
    <form action={submit} className="space-y-3 rounded border bg-white p-4">
      <label className="block text-sm">Description</label>
      <textarea name="description" required minLength={8} className="w-full rounded border p-2" />
      <label className="block text-sm">Priority</label>
      <select name="priority" className="w-full rounded border p-2" defaultValue="MEDIUM">
        <option>LOW</option>
        <option>MEDIUM</option>
        <option>HIGH</option>
        <option>CRITICAL</option>
      </select>
      <label className="block text-sm">Latitude</label>
      <input name="latitude" type="number" step="0.000001" className="w-full rounded border p-2" required />
      <label className="block text-sm">Longitude</label>
      <input name="longitude" type="number" step="0.000001" className="w-full rounded border p-2" required />
      <label className="block text-sm">Address</label>
      <input name="address" type="text" className="w-full rounded border p-2" required />
      <label className="block text-sm">Zone UUID</label>
      <input name="zoneId" type="text" className="w-full rounded border p-2" required />
      <button className="rounded bg-blue-600 px-4 py-2 text-white" type="submit">
        Submit
      </button>
      {status ? <p className="text-sm">{status}</p> : null}
    </form>
  );
}
