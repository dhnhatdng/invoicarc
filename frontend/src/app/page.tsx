import Link from "next/link";
import { FilePlus2, CreditCard, Sparkles, CheckCircle, Flame } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-violet-600/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 md:pt-24 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-6 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered &amp; Native USDC Invoicing
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 max-w-4xl leading-tight">
          Settle Invoices Instantly <br />
          with <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">AI &amp; Native USDC</span>
        </h1>

        <p className="text-slate-400 md:text-xl max-w-2xl mb-10 leading-relaxed">
          Describe your work in plain text. Let AI generate an itemized invoice. 
          Settle payments directly on-chain on <span className="text-violet-400 font-semibold">Arc Testnet</span> using native USDC for predictable, stable gas fees.
        </p>

        {/* CTA Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mb-16">
          {/* Freelancer CTA Card */}
          <Link
            href="/create"
            className="group relative flex flex-col justify-between p-6 rounded-2xl bg-slate-900/40 border border-slate-900 hover:border-violet-500/50 hover:bg-slate-900/60 transition-all duration-300 shadow-xl backdrop-blur-sm"
          >
            <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-violet-600/5 rounded-full blur-2xl group-hover:bg-violet-600/10 transition-all" />
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FilePlus2 className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-1.5">
                  I&apos;m a Freelancer
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Write a description of your work, generate an AI-powered invoice preview, and deploy a request directly to the blockchain.
                </p>
              </div>
            </div>
            <div className="mt-6 text-left text-xs font-semibold text-violet-400 group-hover:text-violet-300 flex items-center gap-1">
              Generate &amp; Request Payment &rarr;
            </div>
          </Link>

          {/* Client CTA Card */}
          <Link
            href="/pay"
            className="group relative flex flex-col justify-between p-6 rounded-2xl bg-slate-900/40 border border-slate-900 hover:border-emerald-500/50 hover:bg-slate-900/60 transition-all duration-300 shadow-xl backdrop-blur-sm"
          >
            <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-emerald-600/5 rounded-full blur-2xl group-hover:bg-emerald-600/10 transition-all" />
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-1.5">
                  I&apos;m a Client
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Enter a request ID, review line items extracted by AI, and complete native USDC transfers with a single wallet click.
                </p>
              </div>
            </div>
            <div className="mt-6 text-left text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 flex items-center gap-1">
              Load &amp; Settle Invoice &rarr;
            </div>
          </Link>
        </div>

        {/* Network & Features Grid */}
        <div className="w-full max-w-5xl border-t border-slate-900 pt-12 pb-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="flex gap-4">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800">
              <Flame className="h-5 w-5 text-violet-400" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">USDC as Native Gas</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deployed on Arc Testnet, meaning USDC serves directly as the gas payment. No ETH needed.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800">
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">AI Invoice Extraction</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Claude Sonnet formats unstructured text descriptions into precise, itemized tables automatically.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800">
              <CheckCircle className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">Pure Decimals Integration</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uses 18-decimal native calculations for value transfers to ensure full smart contract compatibility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
