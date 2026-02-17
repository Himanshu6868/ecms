"use client";

import { Paperclip, SendHorizontal } from "lucide-react";
import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ButtonPrimary } from "@/components/ui/buttons/ButtonPrimary";
import { ButtonSecondary } from "@/components/ui/buttons/ButtonSecondary";
import { FormInput } from "@/components/ui/forms/FormInput";
import { DrawerPanel } from "@/components/ui/panels/DrawerPanel";
import { MessageBubble } from "@/components/tickets/chat/MessageBubble";

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string | null;
  message: string;
  created_at: string;
}

const chatCache = new Map<string, ChatMessage[]>();

export function TicketChatPanel({ ticketId, currentUserId, ticketStatus }: { ticketId: string; currentUserId: string; ticketStatus: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(chatCache.get(ticketId) ?? []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const loadMessages = useCallback(async (targetPage: number, mode: "reset" | "prepend" = "reset") => {
    if (mode === "reset") setLoading(true);
    else setIsLoadingOlder(true);
    setError(null);

    const container = messagesContainerRef.current;
    const prevScrollHeight = container?.scrollHeight ?? 0;
    const prevScrollTop = container?.scrollTop ?? 0;

    try {
      const res = await fetch(`/api/tickets/${ticketId}/chat?page=${targetPage}&pageSize=30`, { cache: "no-store" });
      const body = (await res.json()) as ChatMessage[] | { error?: string };
      if (!res.ok) {
        setError((body as { error?: string }).error ?? "Unable to load chat.");
        if (mode === "reset") setMessages([]);
        return;
      }
      const incoming = Array.isArray(body) ? [...body].reverse() : [];
      setHasMore(incoming.length === 30);

      if (mode === "prepend") {
        setMessages((prev) => {
          const merged = [...incoming, ...prev];
          chatCache.set(ticketId, merged);
          return merged;
        });
        requestAnimationFrame(() => {
          const current = messagesContainerRef.current;
          if (!current) return;
          current.scrollTop = current.scrollHeight - prevScrollHeight + prevScrollTop;
        });
      } else {
        setMessages(incoming);
        chatCache.set(ticketId, incoming);
        requestAnimationFrame(() => {
          messagesContainerRef.current?.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: "auto" });
        });
      }
      setPage(targetPage);
    } catch {
      setError("Unable to load chat.");
    } finally {
      setLoading(false);
      setIsLoadingOlder(false);
    }
  }, [ticketId]);

  const sendMessage = useCallback(async () => {
    const message = input.trim();
    if (!message) return;

    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Unable to send message.");
        return;
      }
      setInput("");
      await loadMessages(1, "reset");
    } catch {
      setError("Unable to send message.");
    } finally {
      setSending(false);
    }
  }, [input, loadMessages, ticketId]);

  useEffect(() => {
    if (!open) return;
    void loadMessages(1, "reset");
    const interval = window.setInterval(() => void loadMessages(1, "reset"), 5000);
    return () => window.clearInterval(interval);
  }, [open, loadMessages]);

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!sending && input.trim()) void sendMessage();
    }
  };

  const messagesLabel = useMemo(() => {
    if (loading) return "Loading chat messages";
    if (!messages.length) return "No messages yet";
    return `${messages.length} messages`;
  }, [loading, messages.length]);

  return (
    <>
      <ButtonSecondary type="button" className="px-3 py-1.5" onClick={() => setOpen(true)}>Chat</ButtonSecondary>
      <DrawerPanel
        open={open}
        onClose={() => setOpen(false)}
        title={`Ticket #${ticketId.slice(0, 8)} chat`}
        subtitle="Operational thread"
        ariaLabel="Ticket chat panel"
        headerMeta={<span className="rounded-md border border-[var(--panel-border)] bg-[var(--panel-bg-elevated)] px-2 py-1 text-xs text-text-secondary">{ticketStatus}</span>}
        footer={
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ButtonSecondary type="button" className="p-2" aria-label="Attach file" disabled>
                <Paperclip className="h-4 w-4" />
              </ButtonSecondary>
              <FormInput value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleInputKeyDown} placeholder="Write an update" maxLength={2000} disabled={sending} aria-label="Message input" />
              <ButtonPrimary type="button" className="p-2" onClick={() => void sendMessage()} disabled={sending || !input.trim()} aria-label="Send message">
                <SendHorizontal className="h-4 w-4" />
              </ButtonPrimary>
            </div>
            {error ? <p className="text-xs text-state-error">{error}</p> : null}
          </div>
        }
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="mb-3 flex items-center justify-between border-b border-[var(--panel-border)] pb-3">
            <p className="text-xs text-text-placeholder">Real-time collaboration</p>
            {hasMore ? (
              <ButtonSecondary type="button" className="px-2 py-1 text-xs" onClick={() => void loadMessages(page + 1, "prepend")} disabled={isLoadingOlder}>
                {isLoadingOlder ? "Loading…" : "Load older"}
              </ButtonSecondary>
            ) : null}
          </div>

          <div ref={messagesContainerRef} role="log" aria-live="polite" aria-label="Ticket chat messages" aria-busy={loading} className="ticket-scroll-area flex-1 space-y-2 overflow-y-auto rounded-md border border-[var(--panel-border)] bg-[var(--panel-bg)] p-3">
            <p className="sr-only">{messagesLabel}</p>
            {!loading && messages.length === 0 ? <p className="text-sm text-text-placeholder">No messages yet.</p> : null}
            {messages.map((msg) => {
              const mine = msg.sender_id === currentUserId;
              return <MessageBubble key={msg.id} content={msg.message} senderLabel={mine ? "You" : msg.sender_name || "Support"} timestamp={msg.created_at} isCurrentUser={mine} />;
            })}
          </div>
        </div>
      </DrawerPanel>
    </>
  );
}
