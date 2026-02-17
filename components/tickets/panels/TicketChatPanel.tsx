"use client";

import { Paperclip, SendHorizontal } from "lucide-react";
import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Drawer } from "@/components/ui/overlays/Drawer";
import { TicketBadge } from "@/components/tickets/shared/TicketBadge";

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
    if (mode === "reset") {
      setLoading(true);
    } else {
      setIsLoadingOlder(true);
    }
    setError(null);

    const container = messagesContainerRef.current;
    const prevScrollHeight = container?.scrollHeight ?? 0;
    const prevScrollTop = container?.scrollTop ?? 0;

    try {
      const res = await fetch(`/api/tickets/${ticketId}/chat?page=${targetPage}&pageSize=30`, { cache: "no-store" });
      const body = (await res.json()) as ChatMessage[] | { error?: string };
      if (!res.ok) {
        setError((body as { error?: string }).error ?? "Unable to load chat.");
        if (mode === "reset") {
          setMessages([]);
        }
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
          const newScrollHeight = current.scrollHeight;
          current.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
        });
      } else {
        setMessages(incoming);
        chatCache.set(ticketId, incoming);
        requestAnimationFrame(() => {
          const current = messagesContainerRef.current;
          if (!current) return;
          current.scrollTo({ top: current.scrollHeight, behavior: "auto" });
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

    const interval = window.setInterval(() => {
      void loadMessages(1, "reset");
    }, 5000);

    return () => window.clearInterval(interval);
  }, [open, loadMessages]);

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!sending && input.trim().length > 0) {
        void sendMessage();
      }
    }
  };

  const messagesLabel = useMemo(() => {
    if (loading) return "Loading chat messages";
    if (!messages.length) return "No messages yet";
    return `${messages.length} messages`;
  }, [loading, messages.length]);

  return (
    <>
      <button type="button" className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setOpen(true)}>
        Chat
      </button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={`Ticket #${ticketId.slice(0, 8)} chat`}
        subtitle="Operational thread"
        ariaLabel="Ticket chat panel"
        headerMeta={<div className="flex items-center gap-2"><TicketBadge tone="live"><span className="mr-1 inline-flex h-1.5 w-1.5 rounded-full bg-violet-500" />Live</TicketBadge><TicketBadge tone="status">{ticketStatus}</TicketBadge></div>}
        footer={
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100" aria-label="Attach file" disabled>
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                className="input-clean h-10 rounded-md border-slate-300"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Write an update"
                maxLength={2000}
                disabled={sending}
                aria-label="Message input"
              />
              <button type="button" className="rounded-md border border-violet-700 bg-violet-600 p-2 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-55" onClick={() => void sendMessage()} disabled={sending || !input.trim()} aria-label="Send message">
                <SendHorizontal className="h-4 w-4" />
              </button>
            </div>
            {error ? <p className="text-xs text-rose-600">{error}</p> : null}
          </div>
        }
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-slate-500">Real-time collaboration</p>
            {hasMore ? (
              <button
                type="button"
                className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-white"
                onClick={() => void loadMessages(page + 1, "prepend")}
                disabled={isLoadingOlder}
              >
                {isLoadingOlder ? "Loading…" : "Load older"}
              </button>
            ) : null}
          </div>

          <div ref={messagesContainerRef} role="log" aria-live="polite" aria-label="Ticket chat messages" aria-busy={loading} className="ticket-scroll-area flex-1 space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-[#f8f8fc] p-3">
            <p className="sr-only">{messagesLabel}</p>
            {!loading && messages.length === 0 ? <p className="text-sm text-slate-500">No messages yet.</p> : null}
            {messages.map((msg) => {
              const mine = msg.sender_id === currentUserId;
              return (
                <article key={msg.id} className={`chat-message-fade-in flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg border px-3 py-2 shadow-[0_1px_6px_rgba(15,23,42,0.06)] ${mine ? "border-violet-100 bg-violet-50 text-violet-900" : "border-slate-200 bg-white text-slate-800"}`}>
                    <div className="mb-1 flex items-center gap-2">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${mine ? "bg-violet-200 text-violet-800" : "bg-slate-200 text-slate-700"}`}>
                        {(mine ? "Y" : msg.sender_name?.slice(0, 1) || "S").toUpperCase()}
                      </span>
                      <p className="text-xs font-medium text-slate-500">{mine ? "You" : msg.sender_name || "Support"}</p>
                    </div>
                    <p className="text-sm leading-6">{msg.message}</p>
                    <p className="mt-1 text-right text-[11px] text-slate-400">{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Drawer>
    </>
  );
}
