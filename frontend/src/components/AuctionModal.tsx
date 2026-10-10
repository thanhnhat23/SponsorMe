'use client';

import React, { useState } from 'react';
import { Listing, Bid } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Gavel, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuctionModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  currentWallet: string | null;
  usdcBalance: number;
  onPlaceBidSuccess: (listingId: string, amount: number) => void;
  onClaimRefundSuccess: (amount: number) => void;
}

export const AuctionModal: React.FC<AuctionModalProps> = ({
  listing,
  isOpen,
  onClose,
  currentWallet,
  usdcBalance,
  onPlaceBidSuccess,
  onClaimRefundSuccess
}) => {
  if (!listing || !listing.auction) return null;

  const auction = listing.auction;
  const currentHighest = auction.current_highest_bid || auction.starting_price;
  const minIncrementRate = 1.05;
  const minRequiredBid = Math.ceil(currentHighest * minIncrementRate);

  const [bidAmount, setBidAmount] = useState<number>(minRequiredBid);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [hasPendingRefund, setHasPendingRefund] = useState(true);
  const pendingRefundAmount = 35;

  const handlePlaceBid = () => {
    setErrorMessage(null);

    if (!currentWallet) {
      setErrorMessage('Please connect your Solana wallet (Phantom or Solflare) before bidding!');
      return;
    }

    if (bidAmount < minRequiredBid) {
      setErrorMessage(`Minimum bid required (+5% increment): $${minRequiredBid} USDC`);
      return;
    }

    if (usdcBalance < bidAmount) {
      setErrorMessage(`Insufficient balance ($${usdcBalance} USDC)!`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessBanner(`Transaction signed! Bid of $${bidAmount} USDC placed in Escrow PDA.`);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      onPlaceBidSuccess(listing.id, bidAmount);
    }, 1000);
  };

  const handleClaimRefund = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setHasPendingRefund(false);
      setSuccessBanner(`Refund of $${pendingRefundAmount} USDC claimed back to your wallet!`);
      onClaimRefundSuccess(pendingRefundAmount);
    }, 800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-black border border-white/20 text-white p-7 rounded-2xl shadow-2xl space-y-4">
        <DialogHeader className="space-y-1.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pr-6">
            <Badge variant="outline" className="border-white/30 text-white bg-white/5 text-[10px] font-mono">
              English Auction (+5% Inc)
            </Badge>
            <span className="text-[11px] font-mono text-zinc-400">
              18h 35m remaining
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-white tracking-tight">
            {listing.device_or_item_name}
          </DialogTitle>
          <p className="text-xs text-zinc-400 font-medium">
            Placement: {listing.placement_location} ({listing.dimension_width_cm}x{listing.dimension_height_cm} cm)
          </p>
        </DialogHeader>

        {/* Pull-Refund Notification */}
        {hasPendingRefund && (
          <div className="bg-zinc-950 border border-white/20 rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">
                  You have an outbid refund ready ($ {pendingRefundAmount} USDC)
                </p>
                <p className="text-[11px] text-zinc-400">
                  Safely withdraw funds via the contract's Pull-Refund mechanism.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleClaimRefund}
              disabled={isSubmitting}
              className="bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-lg"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Claim ${pendingRefundAmount}
            </Button>
          </div>
        )}

        {/* Current Bid Display */}
        <div className="grid grid-cols-2 gap-4 bg-zinc-950 border border-white/10 rounded-xl p-4 font-mono">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Current High Bid</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-white">
                ${auction.current_highest_bid}
              </span>
              <span className="text-xs text-zinc-400">USDC</span>
            </div>
            <span className="text-[10px] text-zinc-500 truncate block">
              Leader: {auction.current_bidder_wallet ? `${auction.current_bidder_wallet.slice(0, 5)}...` : 'None'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Next Minimum Bid</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-white">
                ${minRequiredBid}
              </span>
              <span className="text-xs text-zinc-400">USDC</span>
            </div>
            <span className="text-[10px] text-zinc-500 block">
              Floor: ${auction.starting_price} USDC
            </span>
          </div>
        </div>

        {/* Bidding Form */}
        <div className="space-y-3">
          <label className="text-xs font-mono text-zinc-400 flex items-center justify-between">
            <span>Your Bid Amount (USDC):</span>
            <span>Wallet Balance: {usdcBalance.toFixed(2)} USDC</span>
          </label>

          <div className="flex gap-2.5">
            <Input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              min={minRequiredBid}
              className="bg-zinc-950 border-white/20 text-white font-mono text-lg font-bold rounded-lg"
            />
            <Button
              onClick={handlePlaceBid}
              disabled={isSubmitting}
              className="bg-white hover:bg-zinc-200 text-black font-bold px-6 rounded-lg border border-white text-xs whitespace-nowrap"
            >
              <Gavel className="w-3.5 h-3.5 mr-1.5" />
              {isSubmitting ? 'Signing...' : 'Confirm Bid'}
            </Button>
          </div>

          {errorMessage && (
            <p className="text-xs text-red-400 flex items-center gap-1 font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              {errorMessage}
            </p>
          )}

          {successBanner && (
            <p className="text-xs text-white bg-zinc-950 border border-white/30 p-2.5 rounded-lg flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              {successBanner}
            </p>
          )}
        </div>

        {/* Bid History Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
            Bid History
          </h4>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {auction.bids && auction.bids.length > 0 ? (
              auction.bids.map((bid) => (
                <div
                  key={bid.id}
                  className="flex items-center justify-between text-xs py-2 px-3 bg-zinc-950 rounded-lg border border-white/10 font-mono"
                >
                  <span className="text-zinc-400">{bid.bidder_wallet.slice(0, 6)}...</span>
                  <span className="font-bold text-white">${bid.amount} USDC</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-600 italic font-mono">No bids placed yet.</p>
            )}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};
