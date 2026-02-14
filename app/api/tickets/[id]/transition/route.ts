import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageTicket } from "@/lib/rbac";
import { transitionTicket } from "@/lib/ticketService";
import { ticketTransitionSchema } from "@/lib/validations";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canManageTicket(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = ticketTransitionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const routeParams = await params;
    const ticket = await transitionTicket(routeParams.id, parsed.data.status);
    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 400 });
  }
}
