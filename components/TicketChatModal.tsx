"use client";

import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SendHorizontal, X } from "lucide-react";
import { MessageBubble } from "@/components/MessageBubble";

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string | null;
  message: string;
  created_at: string;
}

interface TicketChatModalProps {
  ticketId: string;
  currentUserId: string;
  currentUserName?: string | null;
}

export function TicketChatModal({ ticketId, currentUserId, currentUserName }: TicketChatModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/chat?page=1&pageSize=50`, { cache: "no-store" });
      const body = (await res.json()) as ChatMessage[] | { error?: string };
      if (!res.ok) {
        setError((body as { error?: string }).error ?? "Unable to load chat.");
        setMessages([]);
        return;
      }
      const nextMessages = Array.isArray(body) ? [...body].reverse() : [];
      setMessages(nextMessages);
    } catch {
      setError("Unable to load chat.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  const sendDisabled = sending || input.trim().length === 0;

  async function sendMessage() {
    const message = input.trim();
    if (!message) {
      return;
    }

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
      await loadMessages();
    } catch {
      setError("Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!sendDisabled) {
        void sendMessage();
      }
    }
  }

  useEffect(() => {
    if (open) {
      void loadMessages();
    }
  }, [open, loadMessages]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const interval = setInterval(() => {
      void loadMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [open, loadMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !open) {
      return;
    }
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const messagesLabel = useMemo(() => {
    if (loading) {
      return "Loading chat messages";
    }
    if (!messages.length) {
      return "No messages yet";
    }
    return `${messages.length} messages`;
  }, [loading, messages.length]);

  return (
    <>
      <button type="button" className="btn-muted px-3 py-1.5 text-sm" onClick={() => setOpen(true)}>
        Chat
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-2 sm:p-4">
          <div className="surface flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
              <div>
                <h3 className="[font-family:var(--font-space)] text-lg font-semibold text-ink-900">Ticket Chat</h3>
                <p className="text-xs text-soft">Real-time collaboration thread</p>
              </div>
              <button
                type="button"
                className="rounded-md p-2 transition-colors hover:bg-brand-100"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={messagesContainerRef}
              role="log"
              aria-live="polite"
              aria-label="Ticket chat messages"
              aria-busy={loading}
              aria-relevant="additions text"
              className="chat-scrollbar flex-1 space-y-3 overflow-y-auto bg-slate-50/75 px-3 py-4 sm:px-5"
            >
              <p className="sr-only">{messagesLabel}</p>
              {loading ? <p className="text-soft text-sm">Loading chat...</p> : null}
              {!loading && messages.length === 0 ? <p className="text-soft text-sm">No messages yet.</p> : null}
              {messages.map((msg) => {
                const isCurrentUser = msg.sender_id === currentUserId;
                const senderLabel = isCurrentUser ? "You" : msg.sender_name || "Support team";

                return (
                  <MessageBubble
                    key={msg.id}
                    content={msg.message}
                    senderLabel={senderLabel}
                    timestamp={msg.created_at}
                    isCurrentUser={isCurrentUser}
                  />
                );
              })}
            </div>

            <div className="sticky bottom-0 border-t border-slate-200 bg-white p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  className="input-clean h-11 rounded-full"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={onInputKeyDown}
                  maxLength={2000}
                  placeholder="Type a message"
                  disabled={sending}
                  aria-label={`Message input for ${currentUserName ?? "you"}`}
                />
                <button
                  type="button"
                  className="btn-brand inline-flex h-11 w-11 items-center justify-center rounded-full p-0 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={sendDisabled}
                  onClick={() => void sendMessage()}
                  aria-label={sending ? "Sending message" : "Send message"}
                >
                  <SendHorizontal className="h-4 w-4" />
                </button>
              </div>
              {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
