import React from 'react';
import { ExternalLink } from 'lucide-react';

interface TxLinkProps {
  hash: string;
  label?: string;
  className?: string;
}

export default function TxLink({ hash, label, className = '' }: TxLinkProps) {
  if (!hash) return null;

  const truncateHash = (str: string) => {
    if (str.length <= 12) return str;
    return `${str.slice(0, 6)}...${str.slice(-4)}`;
  };

  return (
    <a
      href={`https://testnet.arcscan.app/tx/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-mono transition-colors hover:underline ${className}`}
    >
      <span>{label || truncateHash(hash)}</span>
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
