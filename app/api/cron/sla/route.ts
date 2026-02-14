import { NextResponse } from "next/server";
import { runSlaMonitor } from "@/lib/ticketService";

export async function GET() {
  try {
    const count = await runSlaMonitor();
    return NextResponse.json({ escalated: count });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
