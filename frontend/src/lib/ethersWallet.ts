import { ethers } from 'ethers';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  networkName: string;
  balanceEth: string;
  balanceUsdc: number;
  walletName: string | null;
  isDevnet: boolean;
}

// Devnet configuration
export const DEVNET_CONFIG = {
  chainId: 11155111, // Sepolia Testnet / Devnet
  hexChainId: '0xaa36a7',
  name: 'Ethereum Sepolia Devnet',
  rpcUrl: 'https://rpc.sepolia.org',
  currencySymbol: 'SEP',
  blockExplorer: 'https://sepolia.etherscan.io'
};

export const LOCAL_DEVNET_CONFIG = {
  chainId: 31337,
  hexChainId: '0x7a69',
  name: 'Local Devnet (Hardhat/Anvil)',
  rpcUrl: 'http://127.0.0.1:8545',
  currencySymbol: 'ETH',
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Get ethers BrowserProvider from window.ethereum
 */
export const getEthersProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

/**
 * Connect to injected Web3 wallet using ethers.js
 */
export const connectEthersWallet = async (walletType: 'metamask' | 'coinbase' | 'injected' | 'devnet_mock'): Promise<WalletState> => {
  if (walletType === 'devnet_mock') {
    // Simulated Devnet Account
    return {
      isConnected: true,
      address: '0x71C...8482A',
      chainId: DEVNET_CONFIG.chainId,
      networkName: DEVNET_CONFIG.name,
      balanceEth: '1.450',
      balanceUsdc: 350.0,
      walletName: 'Devnet Simulator',
      isDevnet: true,
    };
  }

  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Không tìm thấy ví Web3 (MetaMask/Coinbase) trên trình duyệt của bạn!');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);

  // Request account access
  const accounts = await provider.send('eth_requestAccounts', []);
  if (!accounts || accounts.length === 0) {
    throw new Error('Người dùng đã từ chối yêu cầu kết nối ví.');
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  const balanceWei = await provider.getBalance(address);
  const balanceEth = parseFloat(ethers.formatEther(balanceWei)).toFixed(4);

  const chainId = Number(network.chainId);
  const isDevnet = chainId === DEVNET_CONFIG.chainId || chainId === LOCAL_DEVNET_CONFIG.chainId || chainId === 1337 || chainId === 5;

  let walletName = 'Web3 Wallet';
  if (window.ethereum.isMetaMask) walletName = 'MetaMask';
  else if (window.ethereum.isCoinbaseWallet) walletName = 'Coinbase Wallet';

  return {
    isConnected: true,
    address,
    chainId,
    networkName: isDevnet ? 'Devnet / Testnet' : (network.name || `Chain ID ${chainId}`),
    balanceEth,
    balanceUsdc: 250.0, // Mock testnet USDC balance for MVP
    walletName,
    isDevnet,
  };
};

/**
 * Prompt user to switch to Sepolia Devnet
 */
export const switchToDevnet = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !window.ethereum) return false;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: DEVNET_CONFIG.hexChainId }],
    });
    return true;
  } catch (switchError: any) {
    // If chain has not been added to wallet, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: DEVNET_CONFIG.hexChainId,
              chainName: DEVNET_CONFIG.name,
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: DEVNET_CONFIG.currencySymbol,
                decimals: 18,
              },
              rpcUrls: [DEVNET_CONFIG.rpcUrl],
              blockExplorerUrls: [DEVNET_CONFIG.blockExplorer],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Error adding devnet chain', addError);
        return false;
      }
    }
    console.error('Error switching chain', switchError);
    return false;
  }
};
