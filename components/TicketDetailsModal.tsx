"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function TicketDetailsModal({
  ticketId,
  description,
}: {
  ticketId: string;
  description: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        onClick={() => setOpen(true)}
      >
        Details
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-2 sm:p-4">
          <div className="surface w-full max-w-2xl space-y-4 p-0">
            <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
              <div>
                <h3 className="[font-family:var(--font-space)] text-lg font-semibold text-ink-900">Ticket Details</h3>
                <p className="text-xs text-soft">Ticket #{ticketId.slice(0, 8)}</p>
              </div>
              <button
                type="button"
                className="rounded-md p-2 transition-colors hover:bg-brand-100"
                onClick={() => setOpen(false)}
                aria-label="Close ticket details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-4 pb-5 sm:px-5">
              <h4 className="text-sm font-semibold text-ink-900">Description</h4>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{description}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
