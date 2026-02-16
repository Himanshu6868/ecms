"use client";

import { FormEvent, useMemo, useState } from "react";
import { FadeIn } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InlineToast } from "@/components/ui/toast";

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const typed = error as { formErrors?: unknown; fieldErrors?: Record<string, unknown> };

    if (Array.isArray(typed.formErrors) && typed.formErrors.length > 0) {
      const first = typed.formErrors[0];
      if (typeof first === "string") {
        return first;
      }
    }

    if (typed.fieldErrors && typeof typed.fieldErrors === "object") {
      for (const value of Object.values(typed.fieldErrors)) {
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
          return value[0];
        }
      }
    }
  }

  return "Failed to create ticket";
}

export function TicketCreateForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"success" | "error" | "info">("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const descriptionHint = useMemo(() => `${description.trim().length}/5000`, [description]);

  function detectLocation() {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported in this browser.");
      setStatusTone("error");
      return;
    }

    setIsLocating(true);
    setStatus(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        });
        setStatus("Location captured successfully.");
        setStatusTone("success");
        setIsLocating(false);
      },
      () => {
        setStatus("Unable to fetch location. Please allow location access.");
        setStatusTone("error");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!coords) {
      setStatus("Please capture your location before submitting.");
      setStatusTone("error");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      description: String(formData.get("description")),
      priority: String(formData.get("priority")),
      location: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: `Auto-detected (${coords.latitude}, ${coords.longitude})`,
      },
    };

    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { id?: string; error?: unknown };
      if (!res.ok) {
        setStatus(getErrorMessage(json.error));
        setStatusTone("error");
        return;
      }
      setStatus(`Ticket created successfully: ${json.id?.slice(0, 8) ?? ""}`);
      setStatusTone("success");
      form.reset();
      setDescription("");
      setCoords(null);
    } catch {
      setStatus("Unable to submit ticket right now. Try again.");
      setStatusTone("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="surface-3d p-5 sm:p-6 md:p-8">
      <FadeIn>
        <form onSubmit={submit} className="space-y-6 md:space-y-7">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="description">Issue description</Label>
              <span className="text-xs text-soft">{descriptionHint}</span>
            </div>
            <Textarea
              id="description"
              name="description"
              required
              minLength={8}
              maxLength={5000}
              className="min-h-40"
              placeholder="Describe what happened, business impact, and temporary workaround already attempted."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <input name="priority" type="hidden" value={priority} />
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">LOW</SelectItem>
                  <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                  <SelectItem value="HIGH">HIGH</SelectItem>
                  <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="surface-muted flex flex-wrap items-center gap-3 p-3">
                <Button type="button" variant="secondary" onClick={detectLocation} disabled={isLocating}>
                  {isLocating ? "Fetching..." : "Use Current Location"}
                </Button>
                <p className="text-sm text-soft">{coords ? `${coords.latitude}, ${coords.longitude}` : "No location captured yet"}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-brand-200/80 pt-4">
            <Button variant="secondary" type="reset">
              Clear Form
            </Button>
            <Button className="min-w-36" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </div>

          {status ? <InlineToast message={status} tone={statusTone} /> : null}
        </form>
      </FadeIn>
    </section>
  );
}
