import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ArcScan',
      url: 'https://testnet.arcscan.app',
      apiViewUrl: 'https://testnet.arcscan.app/tx',
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'InvoicArc',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '9e54a5c544c4b691079d3910c6ca7e2f',
  chains: [arcTestnet],
  ssr: true,
});
