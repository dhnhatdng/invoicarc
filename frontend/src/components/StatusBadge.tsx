import React from 'react';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: number | bigint;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusCode = Number(status);

  if (statusCode === 1) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Paid
      </span>
    );
  }

  if (statusCode === 2) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <XCircle className="h-3.5 w-3.5" />
        Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
      <AlertCircle className="h-3.5 w-3.5" />
      Pending
    </span>
  );
}
