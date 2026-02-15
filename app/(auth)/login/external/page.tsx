import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { FadeIn } from "@/components/ui/motion";
import { ArrowLeft } from "lucide-react";

export default function ExternalLoginPage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-10 md:px-8 lg:grid-cols-2">
      <FadeIn className="surface space-y-6 p-7 md:p-10">
        <p className="status-chip inline-flex">NORMAL USER FLOW</p>
        <h1 className="[font-family:var(--font-space)] text-3xl leading-tight font-semibold tracking-tight md:text-5xl">
          Customer and agent access
        </h1>
        <p className="text-soft text-sm md:text-base">
          Customers can create and track incidents. External agents can raise tickets on behalf of customers.
        </p>
        <Link href="/login" className="btn-muted group inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          Back to flow selection
        </Link>
      </FadeIn>

      <div className="mx-auto w-full max-w-lg">
        <AuthForm flow="external" />
      </div>
    </main>
  );
}
