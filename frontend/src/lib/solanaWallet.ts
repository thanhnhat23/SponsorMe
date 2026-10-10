import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';

export interface SolanaWalletState {
  isConnected: boolean;
  publicKey: string | null;
  walletName: 'Phantom' | 'Solflare' | 'Devnet Demo' | null;
  solBalance: number;
  usdcBalance: number;
  network: 'devnet';
  rpcUrl: string;
}

declare global {
  interface Window {
    solana?: any;
    solflare?: any;
  }
}

export const DEVNET_RPC = 'https://api.devnet.solana.com';

export const getSolanaConnection = () => {
  return new Connection(DEVNET_RPC, 'confirmed');
};

/**
 * Connect to Phantom Wallet
 */
export const connectPhantomWallet = async (): Promise<SolanaWalletState> => {
  if (typeof window === 'undefined' || !window.solana || !window.solana.isPhantom) {
    throw new Error('Phantom wallet not found! Please install the Phantom browser extension from phantom.app.');
  }

  const response = await window.solana.connect();
  const publicKeyStr = response.publicKey.toString();

  // Fetch real balance from Devnet RPC
  let solBalance = 0;
  try {
    const connection = getSolanaConnection();
    const balanceLamports = await connection.getBalance(new PublicKey(publicKeyStr));
    solBalance = parseFloat((balanceLamports / LAMPORTS_PER_SOL).toFixed(4));
  } catch (e) {
    console.warn('Could not fetch devnet SOL balance:', e);
  }

  return {
    isConnected: true,
    publicKey: publicKeyStr,
    walletName: 'Phantom',
    solBalance,
    usdcBalance: 250.0, // Devnet mock USDC allocation
    network: 'devnet',
    rpcUrl: DEVNET_RPC,
  };
};

/**
 * Connect to Solflare Wallet
 */
export const connectSolflareWallet = async (): Promise<SolanaWalletState> => {
  if (typeof window === 'undefined' || !window.solflare || !window.solflare.isSolflare) {
    throw new Error('Solflare wallet not found! Please install the Solflare browser extension from solflare.com.');
  }

  await window.solflare.connect();
  const publicKeyStr = window.solflare.publicKey.toString();

  let solBalance = 0;
  try {
    const connection = getSolanaConnection();
    const balanceLamports = await connection.getBalance(new PublicKey(publicKeyStr));
    solBalance = parseFloat((balanceLamports / LAMPORTS_PER_SOL).toFixed(4));
  } catch (e) {
    console.warn('Could not fetch devnet SOL balance:', e);
  }

  return {
    isConnected: true,
    publicKey: publicKeyStr,
    walletName: 'Solflare',
    solBalance,
    usdcBalance: 250.0,
    network: 'devnet',
    rpcUrl: DEVNET_RPC,
  };
};

/**
 * Connect to Devnet Demo Wallet (Zero setup, 1-Click for judging / demo)
 */
export const connectDevnetDemoWallet = (): SolanaWalletState => {
  return {
    isConnected: true,
    publicKey: '7xK9pM4...DevnetSol',
    walletName: 'Devnet Demo',
    solBalance: 2.45,
    usdcBalance: 300.0,
    network: 'devnet',
    rpcUrl: DEVNET_RPC,
  };
};
