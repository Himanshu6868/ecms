"use client";

import { type Ticket } from "@/types/domain";
import { TicketDetailsPanel } from "@/components/tickets/panels/TicketDetailsPanel";

export function TicketDetailsModal({
  ticket,
  assignedTo,
}: {
  ticket: Ticket;
  assignedTo?: string;
}) {
  return <TicketDetailsPanel ticket={ticket} assignedTo={assignedTo} />;
}
