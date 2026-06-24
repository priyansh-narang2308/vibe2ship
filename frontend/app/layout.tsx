import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const outfit = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CivicPulse — Autonomous Civic Intelligence Platform",
  description:
    "CivicPulse turns citizen reports into resolved infrastructure issues automatically using a multi-agent system powered by Google Gemini.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.className}  h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50/50 text-slate-900 font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
