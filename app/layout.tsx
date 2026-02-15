import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Geo Ticket Tracking",
  description: "Production-ready geo-based ticket tracking system",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="text-zinc-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
