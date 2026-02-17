"use client";

import { FileText, ImageIcon } from "lucide-react";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { ButtonSecondary } from "@/components/ui/buttons/ButtonSecondary";
import { DrawerPanel } from "@/components/ui/panels/DrawerPanel";
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

function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-panel-border py-2 last:border-b-0 last:pb-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-text-placeholder">{label}</dt>
      <dd className="text-sm text-text-secondary">{value}</dd>
    </div>
  );
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

  const footer = useMemo(() => <div className="flex justify-end"><ButtonSecondary type="button" onClick={() => setOpen(false)}>Cancel</ButtonSecondary></div>, []);

  return (
    <>
      <ButtonSecondary type="button" className="px-3 py-1.5" onClick={() => { setOpen(true); void ensureDetails(); }}>Details</ButtonSecondary>

      <DrawerPanel
        open={open}
        onClose={() => setOpen(false)}
        title={`Ticket #${ticket.id.slice(0, 8)}`}
        subtitle="Structured case context"
        ariaLabel="Ticket details panel"
        headerMeta={<TicketBadge tone="status">{effectiveTicket.status}</TicketBadge>}
        footer={footer}
      >
        <div className="space-y-4">
          <section className="rounded-md border border-panel-border bg-panel-elevated p-4">
            <h3 className="mb-2 text-sm font-semibold text-text-secondary">Metadata</h3>
            <dl>
              <MetaRow label="ID" value={effectiveTicket.id.slice(0, 8)} />
              <MetaRow label="Status" value={<TicketBadge tone="status">{effectiveTicket.status}</TicketBadge>} />
              <MetaRow label="Priority" value={<TicketBadge tone={priorityTone(effectiveTicket.priority)}>{effectiveTicket.priority}</TicketBadge>} />
              <MetaRow label="Assigned To" value={effectiveAssignedTo} />
              <MetaRow label="Created" value={new Date(effectiveTicket.created_at).toLocaleString()} />
              <MetaRow label="Updated" value={new Date(effectiveTicket.updated_at).toLocaleString()} />
            </dl>
          </section>

          <section className="rounded-md border border-panel-border bg-panel-elevated p-4">
            <h3 className="mb-2 text-sm font-semibold text-text-secondary">Description</h3>
            <p className="whitespace-pre-wrap text-sm leading-6 text-text-primary">{effectiveTicket.description}</p>
          </section>

          <section className="rounded-md border border-panel-border bg-panel-elevated p-4">
            <h3 className="mb-2 text-sm font-semibold text-text-secondary">Attachments</h3>
            {loading ? <p className="text-sm text-text-placeholder">Loading attachments…</p> : null}
            {error ? <p className="text-sm text-state-error">{error}</p> : null}
            {!loading && !error && attachments.length === 0 ? <p className="text-sm text-text-placeholder">No attachments uploaded.</p> : null}
            {!loading && !error && attachments.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {attachments.map((attachment) => (
                  <a key={attachment.id} href={attachment.signed_url} target="_blank" rel="noreferrer" className="rounded-md border border-panel-border bg-panel p-2 transition-colors duration-150 hover:bg-panel-elevated">
                    {isImageAttachment(attachment.file_type) ? (
                      <div className="overflow-hidden rounded-md border border-panel-border bg-panel">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={attachment.signed_url} alt={attachment.file_name} className="h-28 w-full object-cover" loading="lazy" />
                      </div>
                    ) : (
                      <div className="flex h-28 items-center justify-center rounded-md border border-panel-border bg-panel text-text-placeholder">
                        <FileText className="h-6 w-6" />
                      </div>
                    )}
                    <div className="mt-2 flex items-start gap-2">
                      {isImageAttachment(attachment.file_type) ? <ImageIcon className="mt-0.5 h-4 w-4 text-text-placeholder" /> : <FileText className="mt-0.5 h-4 w-4 text-text-placeholder" />}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-text-secondary">{attachment.file_name}</p>
                        <p className="text-xs text-text-placeholder">{formatBytes(attachment.file_size)} • {new Date(attachment.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </DrawerPanel>
    </>
  );
}
