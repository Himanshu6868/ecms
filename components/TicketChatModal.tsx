"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";

interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export function TicketChatModal({ ticketId }: { ticketId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

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
      setMessages(Array.isArray(body) ? body : []);
    } catch {
      setError("Unable to load chat.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

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

  return (
    <>
      <button type="button" className="btn-muted px-3 py-1.5 text-sm" onClick={() => setOpen(true)}>
        Chat
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="surface w-full max-w-2xl p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="[font-family:var(--font-space)] text-lg font-semibold">Ticket Chat</h3>
              <button
                type="button"
                className="rounded-md p-2 hover:bg-brand-100"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="glass max-h-80 space-y-2 overflow-y-auto p-3">
              {loading ? <p className="text-soft text-sm">Loading chat...</p> : null}
              {!loading && messages.length === 0 ? <p className="text-soft text-sm">No messages yet.</p> : null}
              {messages.map((msg) => (
                <div key={msg.id} className="rounded-lg bg-white p-2">
                  <p className="text-soft text-[11px]">{msg.sender_id}</p>
                  <p className="text-sm">{msg.message}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                className="input-clean flex-1"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={2000}
                placeholder="Type a message"
              />
              <button type="button" className="btn-brand px-4" disabled={sending} onClick={sendMessage}>
                {sending ? "Sending..." : "Send"}
              </button>
            </div>

            {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
