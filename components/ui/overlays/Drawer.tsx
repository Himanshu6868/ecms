"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { ModalOverlay } from "@/components/ui/overlays/ModalOverlay";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
  ariaLabel?: string;
  headerMeta?: ReactNode;
}

const focusSelector = "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

export function Drawer({ open, onClose, title, subtitle, children, footer, widthClassName, ariaLabel, headerMeta }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const subtitleId = useId();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(focusSelector);
    focusable?.[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panel) return;
      const elements = panel.querySelectorAll<HTMLElement>(focusSelector);
      if (elements.length === 0) return;
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
  }, [onClose, open]);

  const content = useMemo(() => {
    if (!open) return null;

    return (
      <div className="fixed inset-0 z-[80]">
        <ModalOverlay onClick={onClose} aria-hidden="true" className="animate-overlay-in" />
        <aside className="absolute inset-y-0 right-0 flex max-w-full items-stretch">
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            aria-labelledby={typeof title === "string" ? titleId : undefined}
            aria-describedby={subtitle ? subtitleId : undefined}
            className={cn(
              "ticket-drawer-panel animate-drawer-in flex h-full w-[min(100vw,44rem)] flex-col border-l border-border-default bg-bg-elevated",
              widthClassName,
            )}
          >
            <header className="sticky top-0 z-20 border-b border-border-subtle bg-bg-elevated px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-bg-elevated/95 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <h2 id={titleId} className="truncate text-base font-semibold text-ink-900 sm:text-lg">{title}</h2>
                  {subtitle ? <p id={subtitleId} className="text-xs text-ink-600">{subtitle}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  {headerMeta}
                  <button type="button" className="rounded-md border border-border-default p-2 text-ink-600 transition hover:bg-bg-hover" onClick={onClose} aria-label="Close panel">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </header>
            <div className="ticket-scroll-area min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
            {footer ? <footer className="sticky bottom-0 z-20 border-t border-border-subtle bg-bg-elevated px-4 py-3 sm:px-5">{footer}</footer> : null}
          </div>
        </aside>
      </div>
    );
  }, [open, onClose, ariaLabel, title, titleId, subtitle, subtitleId, widthClassName, children, footer, headerMeta]);

  if (typeof document === "undefined") return null;
  return content ? createPortal(content, document.body) : null;
}
