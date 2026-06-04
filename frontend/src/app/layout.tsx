import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";
import { Wallet, ShieldCheck, FileText, LayoutDashboard } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "InvoicArc | AI Invoice & Payment Agent on Arc Testnet",
  description: "Generate professional invoices using AI and settle them instantly on-chain with native USDC on Arc Testnet. Seamless, fast, and secure payments for freelancers and clients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-200`}
      >
        <Providers>
          {/* Header Navigation */}
          <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/75 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              {/* Logo / Brand */}
              <Link href="/" className="flex items-center gap-2.5 group transition-all duration-200">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent group-hover:text-violet-400 transition-colors">
                  Invoic<span className="text-violet-500">Arc</span>
                </span>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/create"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-900/60 transition-all flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-violet-400" />
                  Create Invoice
                </Link>
                <Link
                  href="/pay"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-900/60 transition-all flex items-center gap-2"
                >
                  <Wallet className="h-4 w-4 text-emerald-400" />
                  Pay Invoice
                </Link>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-900/60 transition-all flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4 text-indigo-400" />
                  Dashboard
                </Link>
              </nav>

              {/* Web3 Connect Button */}
              <div className="flex items-center gap-3">
                <ConnectButton
                  showBalance={false}
                  chainStatus="icon"
                  accountStatus="avatar"
                />
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col">
            {children}
          </main>

          {/* Footer */}
          <footer className="w-full border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                &copy; {new Date().getFullYear()} InvoicArc. Powered by Arc Testnet &amp; Claude AI.
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Arc Testnet Chain: 5042002
                </span>
                <a
                  href="https://testnet.arcscan.app"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-violet-400 transition-colors"
                >
                  ArcScan
                </a>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
