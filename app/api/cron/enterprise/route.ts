import { NextResponse } from "next/server";
import { evaluateDueSlaTimers } from "@/lib/enterprise/slaEngine";

export async function GET(): Promise<NextResponse> {
  try {
    const breachedTimers = await evaluateDueSlaTimers();
    return NextResponse.json({ ok: true, breachedTimers, monitoredAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "SLA enterprise monitor failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
