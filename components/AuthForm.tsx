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
    <div className="app-shell w-full space-y-5 p-6 md:p-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Login</h2>
        <p className="text-sm text-[var(--text-muted)]">Use OTP authentication to continue securely.</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Email</label>
        <input
          className="brand-input w-full px-3 py-2.5"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <button className="brand-button w-full rounded-xl px-4 py-2.5" type="button" onClick={requestOtp}>
        Generate OTP
      </button>

      <div className="space-y-2">
        <label className="block text-sm font-medium">One-Time Password</label>
        <input
          className="brand-input w-full px-3 py-2.5"
          type="text"
          placeholder="Enter code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
      </div>

      <button className="brand-button w-full rounded-xl px-4 py-2.5" type="button" onClick={doSignIn}>
        Sign In
      </button>

      {status ? (
        <p className="rounded-lg bg-[var(--brand-green-soft)] px-3 py-2 text-sm text-emerald-900" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
