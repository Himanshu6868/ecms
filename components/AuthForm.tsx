"use client";

import { FormEvent, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FadeIn } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InlineToast } from "@/components/ui/toast";

type LoginFlow = "external" | "internal";

export function AuthForm({ flow }: { flow: LoginFlow }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"success" | "error" | "info">("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const isInternalFlow = flow === "internal";

  const helperText = useMemo(
    () => (isInternalFlow ? "Use your company email to request a one-time passcode." : "Use your registered email to request OTP access."),
    [isInternalFlow],
  );

  const requestOtp = async () => {
    if (!email.trim()) {
      setStatus("Enter your email first.");
      setStatusTone("error");
      return;
    }

    setIsRequestingOtp(true);
    setStatus(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch("/api/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, flow }),
      });
      const payload = (await res.json()) as { otp?: string; error?: string | { formErrors?: string[]; fieldErrors?: Record<string, string[]> } };
      const errorText = typeof payload.error === "string" ? payload.error : "Failed to generate OTP";
      setStatus(res.ok ? `OTP generated: ${payload.otp ?? "sent"}` : errorText);
      setStatusTone(res.ok ? "success" : "error");
    } catch {
      setStatus("Failed to generate OTP. Check server connection.");
      setStatusTone("error");
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const doSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !otp.trim()) {
      setStatus("Enter email and OTP.");
      setStatusTone("error");
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        flow,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (!result) {
        setStatus("Sign in failed. Try again.");
        setStatusTone("error");
        return;
      }

      if (typeof result === "string") {
        router.push(result);
        router.refresh();
        return;
      }

      if (result.error || !result.ok) {
        setStatus(isInternalFlow ? "Internal sign-in failed. Check OTP and account role." : "Invalid or expired OTP. Generate a new OTP and try again.");
        setStatusTone("error");
        return;
      }

      setStatus("Signed in successfully. Redirecting...");
      setStatusTone("success");
      router.push(result.url ?? "/dashboard");
      router.refresh();
    } catch {
      setStatus("Sign in failed due to a network/server error.");
      setStatusTone("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="surface-3d p-6 md:p-8">
      <form className="space-y-5" onSubmit={doSignIn}>
        <FadeIn className="space-y-5">
          <div className="space-y-2">
            <p className="status-chip inline-flex">{isInternalFlow ? "INTERNAL ACCESS" : "CUSTOMER/AGENT ACCESS"}</p>
            <h2 className="text-page-title">
              {isInternalFlow ? "Team Portal Login" : "User Portal Login"}
            </h2>
            <p className="text-sm text-soft">{helperText}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={isInternalFlow ? "team@company.com" : "you@example.com"} />
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
            <Input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} placeholder="6-digit OTP" />
            <Button variant="secondary" type="button" onClick={requestOtp} disabled={isRequestingOtp}>
              {isRequestingOtp ? "Generating..." : "Generate OTP"}
            </Button>
          </div>

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : isInternalFlow ? "Sign In to Internal Portal" : "Sign In to User Portal"}
          </Button>

          {status ? <InlineToast message={status} tone={statusTone} /> : null}
        </FadeIn>
      </form>
    </section>
  );
}
