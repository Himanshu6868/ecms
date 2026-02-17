"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { FadeIn } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InlineToast } from "@/components/ui/toast";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_UPLOAD_FILES = 6;
const ALLOWED_FILE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

type PendingAttachment = {
  id: string;
  file: File;
  previewUrl: string | null;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

function attachmentError(file: File): string | null {
  if (!ALLOWED_FILE_TYPES.has(file.type)) {
    return `Unsupported file type: ${file.name}`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is larger than 5MB: ${file.name}`;
  }
  return null;
}

export function TicketCreateForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"success" | "error" | "info">("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);

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

  function onFileInput(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.target.files ?? []);
    if (!incoming.length) {
      return;
    }

    if (attachments.length + incoming.length > MAX_UPLOAD_FILES) {
      setStatus(`You can upload up to ${MAX_UPLOAD_FILES} files per ticket.`);
      setStatusTone("error");
      event.target.value = "";
      return;
    }

    const next: PendingAttachment[] = [];
    for (const file of incoming) {
      const invalid = attachmentError(file);
      if (invalid) {
        setStatus(invalid);
        setStatusTone("error");
        continue;
      }

      next.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      });
    }

    setAttachments((previous) => [...previous, ...next]);
    event.target.value = "";
  }

  function removeAttachment(attachmentId: string) {
    setAttachments((previous) => {
      const candidate = previous.find((entry) => entry.id === attachmentId);
      if (candidate?.previewUrl) {
        URL.revokeObjectURL(candidate.previewUrl);
      }
      return previous.filter((entry) => entry.id !== attachmentId);
    });
  }

  function clearAttachments() {
    setAttachments((previous) => {
      for (const item of previous) {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      }
      return [];
    });
  }

  function submitWithProgress(formData: FormData): Promise<Response> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/tickets");
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) {
          return;
        }
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () => {
        resolve(new Response(xhr.responseText, { status: xhr.status }));
      };
      xhr.onerror = () => {
        reject(new Error("Network interruption detected during upload."));
      };
      xhr.send(formData);
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!coords) {
      setStatus("Please capture your location before submitting.");
      setStatusTone("error");
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("priority", priority);
    formData.append("latitude", String(coords.latitude));
    formData.append("longitude", String(coords.longitude));
    formData.append("address", `Auto-detected (${coords.latitude}, ${coords.longitude})`);

    for (const attachment of attachments) {
      formData.append("attachments", attachment.file);
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setStatus(null);

    try {
      const res = await submitWithProgress(formData);
      const json = (await res.json()) as { id?: string; error?: unknown };
      if (!res.ok) {
        setStatus(getErrorMessage(json.error));
        setStatusTone("error");
        return;
      }
      setStatus(`Ticket created successfully: ${json.id?.slice(0, 8) ?? ""}`);
      setStatusTone("success");
      setDescription("");
      setCoords(null);
      clearAttachments();
    } catch (error) {
      setStatus(getErrorMessage(error));
      setStatusTone("error");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
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

          <div className="space-y-3">
            <Label htmlFor="attachments">Attachments (PNG, JPG, WEBP, PDF, DOC, DOCX up to 5MB each, max 6 files)</Label>
            <div className="rounded-xl border border-dashed border-border-subtle bg-bg-surface/40 p-4">
              <input
                id="attachments"
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx"
                onChange={onFileInput}
                className="block w-full text-sm text-soft file:mr-3 file:rounded-lg file:border file:border-border-subtle file:bg-bg-surface file:px-3 file:py-2 file:text-sm file:font-semibold file:text-text-primary"
              />
              <p className="mt-2 text-xs text-soft">Uploads stay private and are securely stored via the server.</p>
            </div>

            {attachments.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {attachments.map((attachment) => (
                  <li key={attachment.id} className="surface-muted space-y-2 rounded-xl border border-border-subtle p-3">
                    {attachment.previewUrl ? (
                      <div className="relative h-36 overflow-hidden rounded-lg border border-border-subtle bg-bg-surface">
                        <Image src={attachment.previewUrl} alt={attachment.file.name} fill className="object-cover" unoptimized />
                      </div>
                    ) : null}
                    <div className="space-y-1">
                      <p className="truncate text-sm font-semibold text-text-primary">{attachment.file.name}</p>
                      <p className="text-xs text-soft">{formatBytes(attachment.file.size)}</p>
                    </div>
                    <Button type="button" variant="secondary" className="w-full" onClick={() => removeAttachment(attachment.id)}>
                      Remove file
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {isSubmitting ? (
            <div className="space-y-2 rounded-lg border border-border-subtle bg-bg-surface p-3">
              <div className="flex items-center justify-between text-xs text-soft">
                <span>Upload progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-bg-surface/80">
                <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 border-t border-border-subtle/80 pt-4">
            <Button variant="secondary" type="reset" onClick={clearAttachments}>
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
