import { parseUnits, formatUnits } from 'viem';

/**
 * Converts a human-readable USDC amount string (e.g. "1.5") into 18-decimal wei BigInt.
 */
export const toWei = (usdc: string): bigint => {
  if (!usdc || isNaN(Number(usdc))) return 0n;
  return parseUnits(usdc, 18);
};

/**
 * Formats an 18-decimal wei BigInt amount into a human-readable USDC string (e.g. "1.50 USDC").
 */
export const formatUSDC = (wei: bigint): string => {
  try {
    return Number(formatUnits(wei, 18)).toFixed(2) + " USDC";
  } catch {
    return "0.00 USDC";
  }
};
