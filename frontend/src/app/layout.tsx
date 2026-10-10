import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { SolanaProvider } from "@/components/SolanaProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SponsorMe — Marketplace Quảng Cáo Nắp Laptop, Vali & Micro-Digital",
  description: "Nền tảng tài trợ vi mô cho lập trình viên, sinh viên và digital nomads với hợp đồng bảo chứng Escrow.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${geistMono.variable} dark`}
    >
      <body className="min-h-screen bg-black text-white font-sans antialiased selection:bg-white selection:text-black">
        <SolanaProvider>
          {children}
        </SolanaProvider>
      </body>
    </html>
  );
}
