import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SimulatorBanner } from "@/components/SimulatorBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "USSD Ghost — simulated USSD, real Whitechain settlement",
  description:
    "Kiosk till payments the payer approves like USSD. USSD simulator — not a live MNO session. Prize USDT on Whitechain Sepolia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SimulatorBanner />
        {children}
      </body>
    </html>
  );
}
