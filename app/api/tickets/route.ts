import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createTicket } from "@/lib/ticketService";
import { dbQuery, supabase } from "@/lib/db";
import { paginationSchema, ticketCreateSchema } from "@/lib/validations";
import { Ticket } from "@/types/domain";
import { assertUploadableFile } from "@/lib/ticketUploads";

export const runtime = "nodejs";
const MAX_UPLOAD_FILES = 6;

function isExternalScoped(role: string, isInternal: boolean): boolean {
  if (role === "CUSTOMER") {
    return true;
  }
  if (role === "AGENT") {
    return !isInternal;
  }
  return !isInternal;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const pager = paginationSchema.parse({
    page: url.searchParams.get("page"),
    pageSize: url.searchParams.get("pageSize"),
  });
  const from = (pager.page - 1) * pager.pageSize;
  const to = from + pager.pageSize - 1;

  const query = supabase.from("tickets").select("*").order("created_at", { ascending: false }).range(from, to);
  const guarded = isExternalScoped(session.user.role, session.user.isInternal)
    ? query.or(`customer_id.eq.${session.user.id},created_by.eq.${session.user.id}`)
    : query;

  const result = await dbQuery<Ticket[]>(() => guarded);

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json(result.data);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  const payload = contentType.includes("multipart/form-data")
    ? await parseMultipartPayload(request)
    : await parseJsonPayload(request);

  if (!payload.success) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  try {
    const ticket = await createTicket({
      customerId: session.user.id,
      createdBy: session.user.id,
      description: payload.data.description,
      priority: payload.data.priority,
      location: payload.data.location,
      files: payload.data.files,
    });
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 400 });
  }
}

async function parseJsonPayload(request: Request): Promise<
  | { success: true; data: { description: string; priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"; location: { latitude: number; longitude: number; address: string }; files: File[] } }
  | { success: false; error: unknown }
> {
  const parsed = ticketCreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  return { success: true, data: { ...parsed.data, files: [] } };
}

async function parseMultipartPayload(request: Request): Promise<
  | { success: true; data: { description: string; priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"; location: { latitude: number; longitude: number; address: string }; files: File[] } }
  | { success: false; error: unknown }
> {
  const formData = await request.formData();
  const files = formData.getAll("attachments").filter((entry): entry is File => entry instanceof File);

  if (files.length > MAX_UPLOAD_FILES) {
    return { success: false, error: `You can upload up to ${MAX_UPLOAD_FILES} files per ticket.` };
  }

  try {
    for (const file of files) {
      assertUploadableFile(file);
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Invalid upload" };
  }

  const parsed = ticketCreateSchema.safeParse({
    description: formData.get("description"),
    priority: formData.get("priority"),
    location: {
      latitude: Number(formData.get("latitude")),
      longitude: Number(formData.get("longitude")),
      address: String(formData.get("address") ?? ""),
    },
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  return { success: true, data: { ...parsed.data, files } };
}
