import React from 'react';
import { formatUSDC } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import { Calendar, User, UserCheck, Receipt, DollarSign, FileText } from 'lucide-react';

interface LineItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceMetadata {
  title?: string;
  description?: string;
  lineItems?: LineItem[];
  subtotal?: number;
  currency?: string;
  notes?: string;
}

interface InvoiceCardProps {
  id?: bigint | number;
  freelancer: string;
  client: string;
  amount: bigint;
  ipfsHash: string;
  status: number | bigint;
  createdAt?: bigint;
  paidAt?: bigint;
}

export default function InvoiceCard({
  id,
  freelancer,
  client,
  amount,
  ipfsHash,
  status,
  createdAt,
  paidAt,
}: InvoiceCardProps) {
  // Attempt to parse metadata JSON
  let meta: InvoiceMetadata = {};
  let isJson = false;

  try {
    if (ipfsHash && (ipfsHash.startsWith('{') || ipfsHash.startsWith('['))) {
      meta = JSON.parse(ipfsHash);
      isJson = true;
    }
  } catch {
    // If fail, treat ipfsHash as plain text description
    isJson = false;
  }

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp?: bigint) => {
    if (!timestamp || timestamp === 0n) return 'N/A';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md hover:border-slate-800 transition-all duration-300">
      {/* Card Header */}
      <div className="bg-slate-900/60 px-6 py-4 border-b border-slate-900/80 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-violet-400" />
          <h3 className="font-bold text-lg text-white">
            {isJson && meta.title ? meta.title : `Invoice #${id ? id.toString() : 'Preview'}`}
          </h3>
          {id !== undefined && (
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
              ID: {id.toString()}
            </span>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Card Body */}
      <div className="p-6 space-y-6">
        {/* Invoice Metadata (Dates & Parties) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs bg-slate-950/40 p-4 rounded-xl border border-slate-900/60">
          <div className="space-y-1">
            <span className="text-slate-500 uppercase font-semibold tracking-wider flex items-center gap-1">
              <User className="h-3 w-3 text-violet-400" />
              Freelancer (From)
            </span>
            <p className="font-mono text-slate-300 hover:text-violet-400 transition-colors break-all" title={freelancer}>
              {truncateAddress(freelancer)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500 uppercase font-semibold tracking-wider flex items-center gap-1">
              <UserCheck className="h-3 w-3 text-emerald-400" />
              Client (To)
            </span>
            <p className="font-mono text-slate-300 hover:text-emerald-400 transition-colors break-all" title={client}>
              {truncateAddress(client)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500 uppercase font-semibold tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              Created At
            </span>
            <p className="text-slate-300">
              {createdAt ? formatDate(createdAt) : formatDate(BigInt(Math.floor(Date.now() / 1000)))}
            </p>
          </div>
        </div>

        {/* Invoice Description / Context */}
        {((isJson && meta.description) || (!isJson && ipfsHash)) && (
          <div className="space-y-1.5">
            <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Work Description
            </span>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/20 p-3 rounded-lg border border-slate-900/40">
              {isJson ? meta.description : ipfsHash}
            </p>
          </div>
        )}

        {/* Line Items Table */}
        {isJson && meta.lineItems && meta.lineItems.length > 0 ? (
          <div className="space-y-2">
            <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Line Items</span>
            <div className="overflow-x-auto rounded-xl border border-slate-900">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 text-xs uppercase border-b border-slate-900">
                    <th className="px-4 py-2.5">Item Description</th>
                    <th className="px-4 py-2.5 text-center w-20">Qty</th>
                    <th className="px-4 py-2.5 text-right w-32">Unit Price</th>
                    <th className="px-4 py-2.5 text-right w-32">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {meta.lineItems.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-900/20 text-slate-300">
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-mono">{Number(item.unitPrice).toFixed(2)} USDC</td>
                      <td className="px-4 py-3 text-right font-mono">
                        {(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)} USDC
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* Total Details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-900">
          <div className="space-y-1">
            {isJson && meta.notes && (
              <p className="text-xs text-slate-500 italic max-w-md">
                <strong>Notes:</strong> {meta.notes}
              </p>
            )}
            {Number(status) === 1 && paidAt && (
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                ✓ Settled on-chain at {formatDate(paidAt)}
              </p>
            )}
          </div>
          <div className="text-right self-end sm:self-auto bg-violet-500/5 px-5 py-3 rounded-2xl border border-violet-500/10">
            <span className="text-xs text-slate-400 block mb-0.5 uppercase font-semibold">Total Amount</span>
            <span className="text-2xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent font-mono flex items-center gap-1">
              <DollarSign className="h-5 w-5 text-violet-400 -mr-1 shrink-0" />
              {formatUSDC(amount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
