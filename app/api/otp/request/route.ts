import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { dbQuery, supabase } from "@/lib/db";
import { otpRequestSchema } from "@/lib/validations";
import { User } from "@/types/domain";

export async function POST(request: Request) {
  const parsed = otpRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  let result = await dbQuery<User>(() => supabase.from("users").select("*").eq("email", email).single());

  if (result.error) {
    const fallbackName = email.split("@")[0] || "Customer";
    result = await dbQuery<User>(() =>
      supabase
        .from("users")
        .insert({ name: fallbackName, email, role: "CUSTOMER" })
        .select("*")
        .single(),
    );
  }

  if (result.error) {
    return NextResponse.json({ error: "Unable to initialize user" }, { status: 500 });
  }

  if (result.data.otp_retry_count >= 5) {
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
      otp_retry_count: result.data.otp_retry_count + 1,
      otp_verified_at: null,
    })
    .eq("id", result.data.id);

  return NextResponse.json({ success: true, otp });
}
