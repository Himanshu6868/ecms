"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function AuthForm() {
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
    const result = await signIn("credentials", { email, otp, redirect: true, callbackUrl: "/dashboard" });
    if (result?.error) {
      setStatus(result.error);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-6">
      <h1 className="text-xl font-semibold">OTP Login</h1>
      <label className="block text-sm font-medium">Email</label>
      <input className="w-full rounded border px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button className="rounded bg-blue-600 px-4 py-2 text-white" type="button" onClick={requestOtp}>
        Generate OTP
      </button>
      <label className="block text-sm font-medium">OTP</label>
      <input className="w-full rounded border px-3 py-2" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />
      <button className="rounded bg-green-600 px-4 py-2 text-white" type="button" onClick={doSignIn}>
        Sign In
      </button>
      {status ? <p className="text-sm text-zinc-700">{status}</p> : null}
    </div>
  );
}
