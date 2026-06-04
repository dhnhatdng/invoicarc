'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { toWei } from '@/lib/utils';
import { Sparkles, FileText, Send, Loader2, AlertTriangle } from 'lucide-react';
import InvoiceCard from '@/components/InvoiceCard';
import TxLink from '@/components/TxLink';

interface LineItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

interface AiInvoice {
  title?: string;
  description?: string;
  lineItems?: LineItem[];
  subtotal?: number;
  currency?: string;
  notes?: string;
}

export default function CreateInvoice() {
  const { isConnected, address } = useAccount();

  // Left Panel State (AI Generator)
  const [workDescription, setWorkDescription] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiInvoice, setAiInvoice] = useState<AiInvoice | null>(null);

  // Right Panel State (Contract Form)
  const [clientAddress, setClientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  // Contract hooks
  const { writeContract, data: txHash, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // Update form fields when AI generates results
  useEffect(() => {
    if (aiInvoice) {
      setAmount(aiInvoice.subtotal?.toString() || '');
      setCustomTitle(aiInvoice.title || '');
    }
  }, [aiInvoice]);

  const handleGenerateInvoice = async () => {
    if (!workDescription.trim()) return;

    setLoadingAi(true);
    setAiError('');
    setAiInvoice(null);

    try {
      const response = await fetch('/api/generate-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: workDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate invoice with AI');
      }

      setAiInvoice(data);
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'An error occurred during invoice generation.';
      setAiError(errMsg);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCreateOnChain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;
    if (!clientAddress.startsWith('0x') || clientAddress.length !== 42) {
      alert('Please enter a valid EVM address for the client.');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    // Prepare JSON payload string to store in ipfsHash
    const ipfsPayload = aiInvoice
      ? JSON.stringify({
          ...aiInvoice,
          title: customTitle || aiInvoice.title || 'Service Invoice',
          subtotal: Number(amount),
        })
      : JSON.stringify({
          title: customTitle || 'Service Invoice',
          description: workDescription || 'Service payment request',
          lineItems: [{ name: 'Provided Services', quantity: 1, unitPrice: Number(amount) }],
          subtotal: Number(amount),
          currency: 'USDC',
        });

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createInvoice',
      args: [clientAddress as `0x${string}`, toWei(amount), ipfsPayload],
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex-1 flex flex-col justify-start">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Freelancer Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Generate an AI invoice draft, review values, and post a payment request to the Arc Testnet.
        </p>
      </div>

      {!isConnected && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl p-4 flex items-center gap-3 mb-8">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm">
            Wallet is not connected. Please connect your wallet at the top right to create on-chain invoices.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT PANEL: AI Generator */}
        <div className="bg-slate-900/20 border border-slate-900/60 p-6 rounded-2xl space-y-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-4">
            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-white">AI Invoice Generator</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Describe your work in plain text
              </label>
              <textarea
                placeholder="e.g. I did 10 hours of backend integration for their React web application at a rate of 50 USDC per hour, and designed 3 logo options for 150 USDC total."
                className="w-full h-40 bg-slate-950/80 border border-slate-900 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
              />
            </div>

            <button
              onClick={handleGenerateInvoice}
              disabled={loadingAi || !workDescription.trim()}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900/40 disabled:text-slate-500 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/15"
            >
              {loadingAi ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Claude is thinking...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Invoice with AI
                </>
              )}
            </button>

            {aiError && (
              <div className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg">
                <strong>Error:</strong> {aiError}
              </div>
            )}
          </div>

          {/* AI Output Card Preview */}
          {aiInvoice && (
            <div className="space-y-3 pt-4 border-t border-slate-900">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                AI Output Draft Preview
              </h3>
              <InvoiceCard
                freelancer={address || '0x0000000000000000000000000000000000000000'}
                client={clientAddress || '0xClientAddress'}
                amount={toWei(amount || aiInvoice.subtotal?.toString() || '0')}
                ipfsHash={JSON.stringify(aiInvoice)}
                status={0} // PENDING preview
              />
            </div>
          )}
        </div>

        {/* RIGHT PANEL: On-Chain Submit Form */}
        <div className="bg-slate-900/20 border border-slate-900/60 p-6 rounded-2xl space-y-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-4">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileText className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Create On-Chain Request</h2>
          </div>

          <form onSubmit={handleCreateOnChain} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Client Wallet Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                className="w-full bg-slate-950/80 border border-slate-900 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Invoice Title
              </label>
              <input
                type="text"
                placeholder="e.g. Website Overhaul Design & Dev"
                className="w-full bg-slate-950/80 border border-slate-900 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex justify-between">
                <span>Requested Amount (USDC)</span>
                {aiInvoice && <span className="text-violet-400 text-[10px] normal-case font-normal">* AI Draft suggested {aiInvoice.subtotal} USDC</span>}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  className="w-full bg-slate-950/80 border border-slate-900 rounded-xl pl-4 pr-16 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                  USDC
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isConnected || isWritePending || isTxConfirming}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/40 disabled:text-slate-500 text-white font-semibold text-sm py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15"
            >
              {isWritePending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Approve Wallet Tx...
                </>
              ) : isTxConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirming Block...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Create Invoice On-Chain
                </>
              )}
            </button>
          </form>

          {/* Transaction Success Alert */}
          {txHash && (
            <div className="pt-4 border-t border-slate-900 space-y-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  ✓ Invoice submitted on-chain!
                </p>
                <div className="text-xs text-slate-400">
                  <span>Transaction Hash: </span>
                  <TxLink hash={txHash} />
                </div>
                {isTxSuccess && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Receipt confirmed! Share the transaction or the Invoice ID on dashboard with your client to settle.
                  </p>
                )}
              </div>
            </div>
          )}

          {writeError && (
            <div className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg">
              <strong>Tx Error:</strong> {writeError.message || 'Transaction was rejected or failed.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
