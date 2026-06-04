'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { formatUSDC } from '@/lib/utils';
import { Search, Loader2, AlertCircle, CreditCard, CheckCircle } from 'lucide-react';
import InvoiceCard from '@/components/InvoiceCard';
import TxLink from '@/components/TxLink';

export default function PayInvoice() {
  const { isConnected, address } = useAccount();

  // Search input and actual queried ID states
  const [searchId, setSearchId] = useState('');
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  // Contract Read hook
  const {
    data: invoice,
    error: readError,
    isLoading: isReadLoading,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getInvoice',
    args: invoiceId ? [BigInt(invoiceId)] : undefined,
    query: {
      enabled: !!invoiceId,
      retry: false,
    },
  });

  // Contract Write hooks
  const { writeContract, data: txHash, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // Refresh invoice data after a successful payment transaction
  useEffect(() => {
    if (isTxSuccess && invoiceId) {
      refetch();
    }
  }, [isTxSuccess, invoiceId, refetch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim() || isNaN(Number(searchId))) {
      alert('Please enter a valid numeric Invoice ID.');
      return;
    }
    setInvoiceId(searchId.trim());
  };

  const handlePay = () => {
    if (!invoice || !invoiceId) return;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'payInvoice',
      args: [BigInt(invoiceId)],
      value: invoice.amount, // native USDC value matching the amount
    });
  };

  const isClient = invoice && address && invoice.client.toLowerCase() === address.toLowerCase();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl flex-1 flex flex-col justify-start">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Client Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Load your on-chain invoice using its ID, review the AI generated line items, and authorize the USDC settlement.
        </p>
      </div>

      {/* Invoice Search Bar */}
      <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl mb-8 backdrop-blur-sm">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Enter Invoice ID (e.g. 1)"
              className="w-full bg-slate-950/80 border border-slate-900/80 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isReadLoading}
            className="bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900/40 disabled:text-slate-500 text-white font-semibold text-sm px-6 rounded-xl transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-violet-600/15"
          >
            {isReadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load Invoice'}
          </button>
        </form>
      </div>

      {/* Main Load Result Area */}
      {isReadLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Fetching invoice data from blockchain...</p>
        </div>
      )}

      {readError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-start gap-3 mb-8">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-bold">Invoice Fetch Failed</h4>
            <p className="mt-1 text-xs text-rose-400/90 leading-relaxed">
              Could not retrieve invoice with ID &quot;{invoiceId}&quot;. Ensure the ID exists and you are connected to the Arc Testnet.
            </p>
          </div>
        </div>
      )}

      {invoice && invoiceId && !isReadLoading && (
        <div className="space-y-6">
          {/* Warn if logged address doesn't match invoice client */}
          {isConnected && address && !isClient && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Connected Account Mismatch</p>
                <p className="text-amber-400/90 leading-relaxed">
                  Your connected account ({address.slice(0, 6)}...{address.slice(-4)}) is not listed as the client for this invoice ({invoice.client.slice(0, 6)}...{invoice.client.slice(-4)}). You will not be able to call the pay function.
                </p>
              </div>
            </div>
          )}

          {/* Render Invoice details card */}
          <InvoiceCard
            id={invoice.id}
            freelancer={invoice.freelancer}
            client={invoice.client}
            amount={invoice.amount}
            ipfsHash={invoice.ipfsHash}
            status={invoice.status}
            createdAt={invoice.createdAt}
            paidAt={invoice.paidAt}
          />

          {/* Pay Button / Receipt Details */}
          {Number(invoice.status) === 0 && (
            <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm">
              <div className="text-left">
                <h4 className="font-bold text-white text-sm">Awaiting Settlement</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  This invoice is pending. Settlement requires transferring exactly {formatUSDC(invoice.amount)} directly to the provider address.
                </p>
              </div>

              <button
                onClick={handlePay}
                disabled={!isConnected || !isClient || isWritePending || isTxConfirming}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950/40 disabled:text-slate-500 text-white font-bold text-sm py-3.5 px-8 rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-emerald-600/15"
              >
                {isWritePending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Approve Wallet...
                  </>
                ) : isTxConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Settling Block...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Pay {formatUSDC(invoice.amount)}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Transaction Status Outputs */}
          {txHash && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                {isTxSuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Settlement Completed!
                  </>
                ) : (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Settle Transaction Submitted
                  </>
                )}
              </p>
              <div className="text-xs text-slate-400">
                <span>Receipt Link: </span>
                <TxLink hash={txHash} />
              </div>
            </div>
          )}

          {writeError && (
            <div className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg">
              <strong>Error:</strong> {writeError.message || 'Payment transaction rejected or reverted.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
