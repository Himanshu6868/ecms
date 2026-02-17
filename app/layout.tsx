import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AppHeader } from "@/components/AppHeader";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Geo Ticket Tracking",
  description: "Production-ready geo-based ticket tracking system",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans overflow-x-clip bg-zinc-50 text-zinc-900 antialiased`}>
        <Providers>
          <AppHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
