'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  Plus, 
  ChevronDown,
  LogOut,
  Layers
} from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SolanaWalletState } from '@/lib/solanaWallet';

interface HeaderProps {
  walletState: SolanaWalletState;
  onOpenConnectModal: () => void;
  onDisconnectWallet: () => void;
  openCreateModal: () => void;
  openCampaignsModal: () => void;
  openBountiesModal: () => void;
  onToggleThesis: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  walletState,
  onOpenConnectModal,
  onDisconnectWallet,
  openCreateModal,
  openCampaignsModal,
  openBountiesModal,
  onToggleThesis,
}) => {
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Minimal Clean Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-zinc-300 transition-colors">
            SponsorMe
          </span>
        </a>

        {/* Clean Center Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs text-zinc-400 font-medium">
          <a href="/#marketplace" className="hover:text-white transition-colors">
            Marketplace
          </a>
          <button 
            onClick={openCampaignsModal}
            className="hover:text-white transition-colors"
          >
            Campaigns
          </button>
          <button 
            onClick={openBountiesModal}
            className="hover:text-white transition-colors font-bold text-white relative"
          >
            Bounties
            <span className="absolute -top-2 -right-3 text-[8px] bg-white text-black px-1 rounded-sm">NEW</span>
          </button>
          <button 
            onClick={onToggleThesis}
            className="hover:text-white transition-colors"
          >
            Thesis
          </button>
          <a href="/profile" className="hover:text-white transition-colors text-white">
            Profile
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* List Placement Button */}
          <Button
            onClick={openCreateModal}
            size="sm"
            className="bg-white hover:bg-zinc-200 text-black font-semibold text-xs h-8 px-3 rounded-md border border-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            List Placement
          </Button>

          {/* Connect X Button */}
          <Button
            size="sm"
            variant="outline"
            className="border-white/20 text-white hover:bg-zinc-900 text-xs h-8 px-3 rounded-md hidden md:flex"
            onClick={async () => {
              const { supabase } = await import('@/lib/supabase');
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'twitter',
                options: {
                  redirectTo: window.location.origin,
                },
              });
              if (error) alert("Error connecting to X: " + error.message);
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 mr-1.5 fill-current text-white"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>
            Connect X
          </Button>

          {/* Real Solana Wallet Button */}
          {mounted ? (
            <WalletMultiButton className="!bg-zinc-950 !border !border-white/20 hover:!border-white !h-8 !px-3 !rounded-md !transition-all !text-xs !font-mono !text-white" />
          ) : (
            <div className="w-[120px] h-8 bg-zinc-900 animate-pulse rounded-md"></div>
          )}

        </div>
      </div>
    </header>
  );
};
