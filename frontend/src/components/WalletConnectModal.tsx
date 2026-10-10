'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Terminal, 
  AlertCircle,
  Cpu
} from 'lucide-react';
import { connectEthersWallet, WalletState, switchToDevnet, DEVNET_CONFIG } from '@/lib/ethersWallet';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected: (state: WalletState) => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  onWalletConnected,
}) => {
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConnect = async (type: 'metamask' | 'coinbase' | 'injected' | 'devnet_mock') => {
    setLoadingType(type);
    setErrorMessage(null);
    try {
      const state = await connectEthersWallet(type);
      onWalletConnected(state);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối ví. Vui lòng kiểm tra lại!');
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-black border border-white/20 text-white p-6 sm:p-7 rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between pb-1">
            <Badge variant="outline" className="border-white/30 text-white font-mono text-[10px] uppercase tracking-wider bg-white/5">
              Ethers.js v6 Provider
            </Badge>
            <span className="text-[11px] font-mono text-zinc-400">
              Chế độ: <strong className="text-white">Devnet</strong>
            </span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white mt-1">
            Kết Nối Ví Web3
          </DialogTitle>
          <p className="text-xs text-zinc-400">
            Chọn ví Web3 thông qua Ethers.js để thực hiện các giao dịch Escrow trên môi trường Devnet.
          </p>
        </DialogHeader>

        {errorMessage && (
          <div className="bg-zinc-900 border border-red-500/40 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Wallet Options List */}
        <div className="space-y-2.5 my-2">
          
          {/* Option 1: MetaMask */}
          <button
            onClick={() => handleConnect('metamask')}
            disabled={!!loadingType}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/10 hover:border-white bg-zinc-950 hover:bg-zinc-900 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:border-white/40">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.8 4.2L12.9 9.9 14.3 6.3 20.8 4.2zM3.2 4.2l6.5 2.1 1.4 3.6L3.2 4.2zM18.8 17.5l-3.3 5 4.7 1.3 1.3-6.2-2.7-.1zM5.2 17.5l-2.7.1 1.3 6.2 4.7-1.3-3.3-5zM12 11.2l-3.2-1.2-1.7 4 4.9 2.5 4.9-2.5-1.7-4L12 11.2z"/>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">MetaMask</h4>
                <p className="text-[11px] text-zinc-400">Kết nối ví trình duyệt phổ biến nhất</p>
              </div>
            </div>
            {loadingType === 'metamask' ? (
              <span className="text-xs font-mono text-zinc-400 animate-pulse">Đang kết nối...</span>
            ) : (
              <span className="text-xs font-mono text-zinc-500 group-hover:text-white transition-colors">Chọn →</span>
            )}
          </button>

          {/* Option 2: Coinbase Wallet */}
          <button
            onClick={() => handleConnect('coinbase')}
            disabled={!!loadingType}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/10 hover:border-white bg-zinc-950 hover:bg-zinc-900 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:border-white/40">
                <div className="w-4 h-4 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Coinbase Wallet</h4>
                <p className="text-[11px] text-zinc-400">Extension hoặc Mobile App</p>
              </div>
            </div>
            {loadingType === 'coinbase' ? (
              <span className="text-xs font-mono text-zinc-400 animate-pulse">Đang kết nối...</span>
            ) : (
              <span className="text-xs font-mono text-zinc-500 group-hover:text-white transition-colors">Chọn →</span>
            )}
          </button>

          {/* Option 3: Browser Injected (Rabby / Brave) */}
          <button
            onClick={() => handleConnect('injected')}
            disabled={!!loadingType}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/10 hover:border-white bg-zinc-950 hover:bg-zinc-900 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:border-white/40">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Injected Web3 Provider</h4>
                <p className="text-[11px] text-zinc-400">Rabby, Brave Wallet, OKX Wallet</p>
              </div>
            </div>
            {loadingType === 'injected' ? (
              <span className="text-xs font-mono text-zinc-400 animate-pulse">Đang kết nối...</span>
            ) : (
              <span className="text-xs font-mono text-zinc-500 group-hover:text-white transition-colors">Chọn →</span>
            )}
          </button>

          {/* Option 4: Devnet Mock Simulator (Quick Test) */}
          <button
            onClick={() => handleConnect('devnet_mock')}
            disabled={!!loadingType}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-dashed border-white/30 hover:border-white bg-white/5 hover:bg-white/10 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-semibold text-white">Ví Test Devnet (1-Click)</h4>
                  <Badge variant="outline" className="border-white/40 text-[9px] px-1.5 py-0 text-white font-mono">
                    Khuyên dùng
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-400">Trải nghiệm ngay không cần cài extension</p>
              </div>
            </div>
            <span className="text-xs font-mono text-white font-bold group-hover:underline">Bắt đầu →</span>
          </button>

        </div>

        {/* Devnet Info Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span>Mạng: {DEVNET_CONFIG.name}</span>
          </div>
          <span className="font-mono text-zinc-400">ID: {DEVNET_CONFIG.chainId}</span>
        </div>

      </DialogContent>
    </Dialog>
  );
};
