'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { formatUSDC } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import InvoiceCard from '@/components/InvoiceCard';
import TxLink from '@/components/TxLink';
import {
  FolderOpen,
  Briefcase,
  User,
  ChevronDown,
  ChevronUp,
  XOctagon,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface InvoiceItemProps {
  id: bigint;
  role: 'freelancer' | 'client';
  onCancelled: () => void;
}

function DashboardInvoiceItem({ id, role, onCancelled }: InvoiceItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Read single invoice
  const {
    data: invoice,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getInvoice',
    args: [id],
    query: {
      retry: false,
    },
  });

  // Cancel invoice write hooks
  const { writeContract, data: cancelTxHash, isPending: isCancelPending } = useWriteContract();
  const { isLoading: isCancelTxConfirming, isSuccess: isCancelTxSuccess } = useWaitForTransactionReceipt({
    hash: cancelTxHash,
  });

  useEffect(() => {
    if (isCancelTxSuccess) {
      refetch();
      onCancelled();
    }
  }, [isCancelTxSuccess, refetch, onCancelled]);

  if (isLoading) {
    return (
      <div className="h-16 w-full bg-slate-900/10 border border-slate-900 animate-pulse rounded-xl flex items-center justify-between px-6">
        <div className="h-4 w-1/4 bg-slate-800 rounded"></div>
        <div className="h-4 w-1/6 bg-slate-800 rounded"></div>
        <div className="h-4 w-12 bg-slate-800 rounded-full"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return null; // Don't render item if fetch fails
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row expansion
    if (confirm(`Are you sure you want to cancel Invoice #${id.toString()}?`)) {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'cancelInvoice',
        args: [id],
      });
    }
  };

  // Attempt to parse metadata for row summary
  let title = `Invoice #${id.toString()}`;
  try {
    if (invoice.ipfsHash && (invoice.ipfsHash.startsWith('{') || invoice.ipfsHash.startsWith('['))) {
      const meta = JSON.parse(invoice.ipfsHash);
      if (meta.title) title = meta.title;
    }
  } catch {
    // ignore
  }

  const dateFormatted = new Date(Number(invoice.createdAt) * 1000).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="border border-slate-900 bg-slate-900/10 hover:border-slate-800 rounded-xl overflow-hidden transition-all">
      {/* Row Header Summary */}
      <div
        className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${role === 'freelancer' ? 'bg-violet-500/10 text-violet-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {role === 'freelancer' ? <Briefcase className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </div>
          <div>
            <h4 className="font-bold text-white text-sm sm:text-base leading-none mb-1">
              {title}
            </h4>
            <span className="text-slate-500 text-xs font-mono">
              ID: {id.toString()} | {dateFormatted}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4">
          <span className="font-mono text-sm font-black text-slate-300">
            {formatUSDC(invoice.amount)}
          </span>

          <div className="flex items-center gap-2">
            <StatusBadge status={invoice.status} />

            {/* Cancel Button (only for Freelancer on Pending) */}
            {role === 'freelancer' && Number(invoice.status) === 0 && (
              <button
                onClick={handleCancel}
                disabled={isCancelPending || isCancelTxConfirming}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all shrink-0"
                title="Cancel Invoice"
              >
                {isCancelPending || isCancelTxConfirming ? (
                  <Loader2 className="h-4 w-4 animate-spin text-rose-400" />
                ) : (
                  <XOctagon className="h-4 w-4" />
                )}
              </button>
            )}

            <div className="text-slate-500">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Detail Panel */}
      {isExpanded && (
        <div className="p-6 border-t border-slate-900 bg-slate-950/20 space-y-4">
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

          {cancelTxHash && (
            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-900 text-xs flex items-center justify-between">
              <span className="text-slate-400">Cancel request submitted:</span>
              <TxLink hash={cancelTxHash} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { isConnected, address } = useAccount();
  const [role, setRole] = useState<'freelancer' | 'client'>('freelancer');

  // Query arrays of IDs
  const {
    data: freelancerInvoiceIds,
    isLoading: isFreelancerLoading,
    error: freelancerError,
    refetch: refetchFreelancer,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getInvoicesByFreelancer',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && role === 'freelancer',
    },
  });

  const {
    data: clientInvoiceIds,
    isLoading: isClientLoading,
    error: clientError,
    refetch: refetchClient,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getInvoicesByClient',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && role === 'client',
    },
  });

  const handleCancelledCallback = () => {
    if (role === 'freelancer') refetchFreelancer();
    else refetchClient();
  };

  // Re-fetch lists when switching roles
  useEffect(() => {
    if (isConnected && address) {
      if (role === 'freelancer') refetchFreelancer();
      else refetchClient();
    }
  }, [role, isConnected, address, refetchFreelancer, refetchClient]);

  const activeIds = role === 'freelancer' ? freelancerInvoiceIds : clientInvoiceIds;
  const isLoading = role === 'freelancer' ? isFreelancerLoading : isClientLoading;
  const loadError = role === 'freelancer' ? freelancerError : clientError;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl flex-1 flex flex-col justify-start">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            My Invoices
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track and manage your submitted payment requests or review received bills.
          </p>
        </div>

        {/* Role Toggle Switch */}
        <div className="inline-flex p-1 bg-slate-900 border border-slate-900/80 rounded-xl shrink-0 self-start sm:self-auto shadow-inner">
          <button
            onClick={() => setRole('freelancer')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              role === 'freelancer'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            As Freelancer
          </button>
          <button
            onClick={() => setRole('client')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              role === 'client'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            As Client
          </button>
        </div>
      </div>

      {!isConnected && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">
            Please connect your wallet to view your historical invoices.
          </span>
        </div>
      )}

      {isConnected && (
        <>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Querying invoice logs...</p>
            </div>
          ) : loadError ? (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-bold">Failed to load invoice lists</h4>
                <p className="mt-1 text-xs text-rose-400/90 leading-relaxed">
                  There was an error communicating with the smart contract logs. Ensure your connection to Arc Testnet is stable.
                </p>
              </div>
            </div>
          ) : !activeIds || activeIds.length === 0 ? (
            <div className="border border-dashed border-slate-900 p-16 rounded-2xl flex flex-col items-center justify-center text-center gap-4 bg-slate-900/5">
              <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <FolderOpen className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">No Invoices Found</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  We couldn&apos;t find any invoice records linked to this address under the &quot;{role}&quot; role.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-wider px-2">
                <span>Description / ID</span>
                <span>Amount / Status</span>
              </div>
              {/* Order invoices by ID descending (newest first) */}
              {[...activeIds].reverse().map((id) => (
                <DashboardInvoiceItem
                  key={id.toString()}
                  id={id}
                  role={role}
                  onCancelled={handleCancelledCallback}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
