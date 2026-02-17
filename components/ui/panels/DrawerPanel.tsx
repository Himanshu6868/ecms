"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface DrawerPanelProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  ariaLabel?: string;
  headerMeta?: ReactNode;
  widthClassName?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const focusSelector = "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

export function PanelHeader({ title, subtitle, onClose, headerMeta, titleId, subtitleId }: { title: ReactNode; subtitle?: ReactNode; onClose: () => void; headerMeta?: ReactNode; titleId?: string; subtitleId?: string }) {
  return (
    <header className="border-b border-[var(--panel-border)] bg-[var(--panel-bg)] px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id={titleId} className="truncate text-base font-semibold text-text-primary">{title}</h2>
          {subtitle ? <p id={subtitleId} className="mt-1 text-xs text-text-placeholder">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {headerMeta}
          <button type="button" onClick={onClose} aria-label="Close panel" className="rounded-md border border-[var(--panel-border)] bg-[var(--panel-bg-elevated)] p-2 text-text-placeholder transition-colors duration-150 hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function PanelBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("ticket-scroll-area min-h-0 flex-1 overflow-y-auto bg-[var(--panel-bg)] px-6 py-4", className)}>{children}</div>;
}

export function PanelFooter({ className, children }: { className?: string; children: ReactNode }) {
  return <footer className={cn("border-t border-[var(--panel-border)] bg-[var(--panel-bg)] px-6 py-4", className)}>{children}</footer>;
}

export function DrawerPanel({ open, onClose, title, subtitle, ariaLabel, headerMeta, widthClassName, children, footer }: DrawerPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const subtitleId = useId();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    panelRef.current?.querySelectorAll<HTMLElement>(focusSelector)?.[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const elements = panelRef.current.querySelectorAll<HTMLElement>(focusSelector);
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const content = useMemo(() => {
    if (!open) return null;

    return (
      <div className="fixed inset-0 z-[100] overflow-hidden">
        <div className="absolute inset-0 bg-[var(--bg-page)]" onClick={onClose} aria-hidden="true" />
        <div className="absolute inset-y-0 right-0 flex max-w-full items-stretch">
          <aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            aria-labelledby={typeof title === "string" ? titleId : undefined}
            aria-describedby={subtitle ? subtitleId : undefined}
            className={cn("flex h-full w-[min(100vw,46rem)] flex-col border-l border-[var(--panel-border)] bg-[var(--panel-bg)]", widthClassName)}
          >
            <PanelHeader title={title} subtitle={subtitle} onClose={onClose} headerMeta={headerMeta} titleId={titleId} subtitleId={subtitle ? subtitleId : undefined} />
            <PanelBody>{children}</PanelBody>
            {footer ? <PanelFooter>{footer}</PanelFooter> : null}
          </aside>
        </div>
      </div>
    );
  }, [open, onClose, ariaLabel, title, subtitle, headerMeta, widthClassName, children, footer, titleId, subtitleId]);

  if (typeof document === "undefined") return null;
  return content ? createPortal(content, document.body) : null;
}
