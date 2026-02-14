import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { dbQuery, supabase } from "@/lib/db";
import { otpVerifySchema } from "@/lib/validations";
import { User } from "@/types/domain";

export async function POST(request: Request) {
  const parsed = otpVerifySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await dbQuery<User>(() => supabase.from("users").select("*").eq("email", parsed.data.email).single());
  if (result.error) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const user = result.data;
  if (!user.otp_hash || !user.otp_expires_at) {
    return NextResponse.json({ error: "OTP not requested" }, { status: 400 });
  }

  if (new Date(user.otp_expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: "OTP expired" }, { status: 400 });
  }

  const verified = await bcrypt.compare(parsed.data.otp, user.otp_hash);
  if (!verified) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
  }

  await supabase
    .from("users")
    .update({ otp_hash: null, otp_expires_at: null, otp_verified_at: new Date().toISOString(), otp_retry_count: 0 })
    .eq("id", user.id);

  return NextResponse.json({ success: true });
}
