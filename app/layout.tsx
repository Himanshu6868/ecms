import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Geo Ticket Tracking",
  description: "Production-ready geo-based ticket tracking system",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} bg-zinc-50 text-zinc-900 antialiased [font-family:var(--font-manrope)]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
