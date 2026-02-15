"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FadeIn, HoverLift } from "@/components/ui/motion";

export function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const requestOtp = async () => {
    const res = await fetch("/api/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload = (await res.json()) as { otp?: string; error?: string };
    setStatus(res.ok ? `OTP generated: ${payload.otp ?? "sent"}` : payload.error ?? "Failed");
  };

  const doSignIn = async () => {
    const result = await signIn("credentials", { email, otp, redirect: false, callbackUrl: "/dashboard" });
    if (result?.error) {
      setStatus(result.error);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <HoverLift className="surface-3d p-6 md:p-8">
      <FadeIn className="space-y-5">
        <div className="space-y-2">
          <p className="status-chip inline-flex">SECURE ACCESS</p>
          <h1 className="[font-family:var(--font-space)] text-2xl font-semibold tracking-tight md:text-3xl">OTP Login</h1>
          <p className="text-soft text-sm">Generate a one-time passcode and use it to enter your dashboard.</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Email</label>
          <input className="input-clean" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button className="btn-muted" type="button" onClick={requestOtp}>
            Generate OTP
          </button>
          <input className="input-clean" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} placeholder="Enter 6-digit OTP" />
        </div>

        <button className="btn-brand w-full" type="button" onClick={doSignIn}>
          Sign In
        </button>

        {status ? <p className="glass px-3 py-2 text-sm text-soft">{status}</p> : null}
      </FadeIn>
    </HoverLift>
  );
}
