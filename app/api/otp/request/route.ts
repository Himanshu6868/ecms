import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { dbQuery, supabase } from "@/lib/db";
import { otpRequestSchema } from "@/lib/validations";
import { Role, User } from "@/types/domain";
import { isInternalUserContext, normalizeEmail, roleForInternalActorEmail } from "@/lib/internalActors";

const externalRoles: Role[] = ["CUSTOMER", "AGENT"];
const internalRoles: Role[] = ["AGENT", "SENIOR_AGENT", "MANAGER", "ADMIN"];

export async function POST(request: Request) {
  const parsed = otpRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const flow = parsed.data.flow;
  let result = await dbQuery<User>(() => supabase.from("users").select("*").eq("email", email).single());

  if (result.error) {
    if (flow === "internal") {
      const mappedRole = roleForInternalActorEmail(email);
      if (!mappedRole) {
        return NextResponse.json({ error: "Internal account not found. Contact admin." }, { status: 404 });
      }

      const fallbackName = email.split("@")[0] || "InternalUser";
      result = await dbQuery<User>(() =>
        supabase
          .from("users")
          .insert({ name: fallbackName, email, role: mappedRole })
          .select("*")
          .single(),
      );
    } else {
      const fallbackName = email.split("@")[0] || "Customer";
      result = await dbQuery<User>(() =>
        supabase
          .from("users")
          .insert({ name: fallbackName, email, role: "CUSTOMER" })
          .select("*")
          .single(),
      );
    }
  }

  if (result.error) {
    return NextResponse.json({ error: "Unable to initialize user" }, { status: 500 });
  }

  let currentUser = result.data;
  if (!currentUser) {
    return NextResponse.json({ error: "Unable to initialize user" }, { status: 500 });
  }

  const mappedInternalRole = roleForInternalActorEmail(email);
  if (mappedInternalRole && currentUser.role !== mappedInternalRole) {
    const synced = await dbQuery<User>(() =>
      supabase.from("users").update({ role: mappedInternalRole }).eq("id", currentUser.id).select("*").single(),
    );
    if (!synced.error && synced.data) {
      currentUser = synced.data;
    }
  }

  const userRole = currentUser.role;
  const internalUser = isInternalUserContext({ email, role: userRole, reportsTo: currentUser.reports_to });
  if (flow === "external" && (internalUser || !externalRoles.includes(userRole))) {
    return NextResponse.json({ error: "Use internal login for this account." }, { status: 403 });
  }
  if (flow === "internal" && (!internalRoles.includes(userRole) || !internalUser)) {
    return NextResponse.json({ error: "Use customer/agent login for this account." }, { status: 403 });
  }

  if (currentUser.otp_retry_count >= 5) {
    return NextResponse.json({ error: "OTP retry limit exceeded" }, { status: 429 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 12);
  const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await supabase
    .from("users")
    .update({
      otp_hash: otpHash,
      otp_expires_at: expires,
      otp_retry_count: currentUser.otp_retry_count + 1,
      otp_verified_at: null,
    })
    .eq("id", currentUser.id);

  return NextResponse.json({ success: true, otp });
}
