"use client";

import { TicketChatPanel } from "@/components/tickets/panels/TicketChatPanel";

interface TicketChatModalProps {
  ticketId: string;
  currentUserId: string;
  currentUserName?: string | null;
  ticketStatus: string;
}

export function TicketChatModal({ ticketId, currentUserId, ticketStatus }: TicketChatModalProps) {
  return <TicketChatPanel ticketId={ticketId} currentUserId={currentUserId} ticketStatus={ticketStatus} />;
}
