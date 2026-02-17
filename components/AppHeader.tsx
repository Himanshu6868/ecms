"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function AppHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`app-header-mirror sticky top-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? "app-header-mirror-solid border-border-default"
          : "app-header-mirror-transparent border-border-subtle"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between px-3 py-3 md:px-6">
        <Link className="flex items-center gap-3" href="/dashboard">
          <span className="relative h-10 w-10 overflow-hidden rounded-lg border border-border-default bg-bg-elevated">
            <Image alt="DG LIGER logo" fill priority sizes="40px" src="/dgliger-logo.webp" />
          </span>
          <span>
            <strong className="block text-card-title text-ink-900">
              DG LIGER
            </strong>
            <span className="text-meta block text-ink-700">Enterprise Case Management</span>
          </span>
        </Link>
        <span className="text-meta rounded-full border border-border-default bg-bg-elevated px-3 py-1 font-medium tracking-[0.1em] text-ink-700">
          LIVE OPS
        </span>
      </div>
    </header>
  );
}
