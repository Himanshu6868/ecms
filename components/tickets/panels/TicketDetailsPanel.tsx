"use client";

import { FileText, ImageIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Drawer } from "@/components/ui/overlays/Drawer";
import { KeyValueRow, PanelCard } from "@/components/tickets/shared/PanelCard";
import { TicketBadge, priorityTone } from "@/components/tickets/shared/TicketBadge";
import { type Ticket } from "@/types/domain";

interface TicketAttachmentView {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  signed_url: string;
}

interface TicketDetailsPayload {
  ticket: Ticket;
  assignedTo: string | null;
  attachments: TicketAttachmentView[];
}

const detailsCache = new Map<string, TicketDetailsPayload>();

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageAttachment(type: string): boolean {
  return type.startsWith("image/");
}

export function TicketDetailsPanel({ ticket, assignedTo }: { ticket: Ticket; assignedTo?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<TicketDetailsPayload | null>(detailsCache.get(ticket.id) ?? null);

  const ensureDetails = useCallback(async () => {
    if (detailsCache.has(ticket.id)) {
      setPayload(detailsCache.get(ticket.id) ?? null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/details`, { cache: "no-store" });
      const body = (await res.json()) as TicketDetailsPayload | { error?: string };
      if (!res.ok) {
        setError((body as { error?: string }).error ?? "Unable to load ticket details.");
        return;
      }
      const typed = body as TicketDetailsPayload;
      detailsCache.set(ticket.id, typed);
      setPayload(typed);
    } catch {
      setError("Unable to load ticket details.");
    } finally {
      setLoading(false);
    }
  }, [ticket.id]);

  const effectiveTicket = payload?.ticket ?? ticket;
  const effectiveAssignedTo = payload?.assignedTo ?? assignedTo ?? "Unassigned";
  const attachments = payload?.attachments ?? [];

  const footer = useMemo(
    () => (
      <div className="flex items-center justify-end">
        <button type="button" className="rounded-md border border-slate-300 bg-bg-elevated px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>
    ),
    [],
  );

  return (
    <>
      <button type="button" className="rounded-md border border-slate-300 bg-bg-elevated px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => { setOpen(true); void ensureDetails(); }}>
        Details
      </button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={`Ticket #${ticket.id.slice(0, 8)}`}
        subtitle="Structured case context"
        ariaLabel="Ticket details panel"
        headerMeta={<TicketBadge tone="status">{effectiveTicket.status}</TicketBadge>}
        footer={footer}
      >
        <div className="space-y-3">
          <PanelCard>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Ticket Metadata</h3>
            <dl>
              <KeyValueRow label="ID" value={effectiveTicket.id.slice(0, 8)} />
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
                <dd><TicketBadge tone="status">{effectiveTicket.status}</TicketBadge></dd>
              </div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Priority</dt>
                <dd><TicketBadge tone={priorityTone(effectiveTicket.priority)}>{effectiveTicket.priority}</TicketBadge></dd>
              </div>
              <KeyValueRow label="Assigned To" value={effectiveAssignedTo} />
              <KeyValueRow label="Created" value={new Date(effectiveTicket.created_at).toLocaleString()} />
              <KeyValueRow label="Updated" value={new Date(effectiveTicket.updated_at).toLocaleString()} />
            </dl>
          </PanelCard>

          <PanelCard>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Description</h3>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{effectiveTicket.description}</p>
          </PanelCard>

          <PanelCard>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Attachments</h3>
            {loading ? <p className="text-sm text-slate-500">Loading attachments…</p> : null}
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            {!loading && !error && attachments.length === 0 ? <p className="text-sm text-slate-500">No attachments uploaded.</p> : null}
            {!loading && !error && attachments.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.signed_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-lg border border-slate-200 bg-bg-elevated p-2 transition hover:-translate-y-0.5 hover:border-theme-primary/55 hover:shadow-[0_8px_18px_rgba(109,40,217,0.14)]"
                  >
                    {isImageAttachment(attachment.file_type) ? (
                      <div className="overflow-hidden rounded-md border border-slate-100 bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={attachment.signed_url} alt={attachment.file_name} className="h-28 w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                      </div>
                    ) : (
                      <div className="flex h-28 items-center justify-center rounded-md border border-slate-100 bg-slate-50 text-slate-500">
                        <FileText className="h-6 w-6" />
                      </div>
                    )}
                    <div className="mt-2 flex items-start gap-2">
                      {isImageAttachment(attachment.file_type) ? <ImageIcon className="mt-0.5 h-4 w-4 text-slate-400" /> : <FileText className="mt-0.5 h-4 w-4 text-slate-400" />}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-slate-700">{attachment.file_name}</p>
                        <p className="text-xs text-slate-500">{formatBytes(attachment.file_size)} • {new Date(attachment.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : null}
          </PanelCard>
        </div>
      </Drawer>
    </>
  );
}
