'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Maximize2, 
  CheckCircle2, 
  Gavel
} from 'lucide-react';
import { Listing } from '@/types/database';
import { Tweet } from 'react-tweet';
import { ImageRegionSelector } from './ImageRegionSelector';

interface ListingDetailModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onQuickBuy: (listing: Listing, selectedRoiId?: string, actualPrice?: number) => void;
  onOpenAuction: (listing: Listing) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  isOpen,
  onClose,
  onQuickBuy,
  onOpenAuction
}) => {
  const [selectedRoiIndex, setSelectedRoiIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!listing) return null;

  const isAuction = listing.listing_type === 1;

  const handleBuy = (action: 'buy' | 'auction') => {
    if (listing.rois && listing.rois.length > 0 && selectedRoiIndex === null) {
      setError('Please select a specific spot on the image first!');
      return;
    }
    setError(null);
    onClose();
    
    const selectedRoi = selectedRoiIndex !== null && listing.rois ? listing.rois[selectedRoiIndex] : null;
    const actualPrice = selectedRoi?.price !== undefined ? selectedRoi.price : listing.price;
    const selectedRoiId = selectedRoi?.id;

    if (action === 'buy') {
      onQuickBuy(listing, selectedRoiId, actualPrice);
    } else {
      onOpenAuction(listing);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-4xl w-[95vw] bg-black border border-white/20 text-white p-7 rounded-sm shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-1 pr-6">
            <Badge variant="outline" className="border-white/30 text-white font-mono text-[10px]">
              {isAuction ? 'English Auction' : 'Fixed Escrow'}
            </Badge>
            {isAuction && (
              <span className="text-xs font-mono text-zinc-400">
                24h
              </span>
            )}
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-white">
            {listing.device_or_item_name}
          </DialogTitle>
          <p className="text-xs text-zinc-400 font-medium">
            Exact Spot: {listing.placement_location}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-2">
          
          {/* Left: Image preview & physical dimensions */}
          <div className="space-y-4">
            {listing.x_post_id ? (
              <div className="w-full bg-black border border-white/10 rounded-xl overflow-hidden flex justify-center max-h-96 overflow-y-auto" data-theme="dark">
                <Tweet id={listing.x_post_id} />
              </div>
            ) : (
              <div className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-zinc-950">
                <ImageRegionSelector
                  imageUrl={listing.image_url || ''}
                  rois={listing.rois || []}
                  readOnly={true}
                  selectedRoiId={selectedRoiIndex !== null ? listing.rois?.[selectedRoiIndex]?.id : undefined}
                  onSelectRoi={(roi) => {
                    if (roi.isSold) {
                      setError('This spot is already sold!');
                      return;
                    }
                    const idx = listing.rois?.findIndex(r => r.id === roi.id);
                    if (idx !== undefined && idx >= 0) {
                      setSelectedRoiIndex(idx);
                      setError(null);
                    }
                  }}
                />
                {listing.surface_area_cm2 ? (
                  <div className="absolute bottom-3 left-3 bg-black/90 backdrop-blur-md px-2.5 py-1 rounded border border-white/20 text-xs font-mono text-white flex items-center gap-1.5 z-20">
                    <Maximize2 className="w-3 h-3 text-zinc-400" />
                    {listing.dimension_width_cm} x {listing.dimension_height_cm} cm ({listing.surface_area_cm2} cm²)
                  </div>
                ) : null}
              </div>
            )}

            <div className="bg-zinc-950 border border-white/10 rounded-xl p-4 space-y-3 text-xs font-mono">
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-500">Frequency:</span>
                <span className="text-zinc-300">Daily routine (6-8h/day)</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-500">Estimated Reach:</span>
                <span className="text-white font-bold">~{listing.estimated_weekly_impressions.toLocaleString()} views/week</span>
              </div>
            </div>
          </div>

          {/* Right: Creator Profile & Rules */}
          <div className="space-y-5 flex flex-col justify-between">
            <div>
              {listing.creator && (
                <div className="bg-zinc-950 border border-white/10 rounded-xl p-4 mb-3.5 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/20">
                      <AvatarImage src={listing.creator.x_avatar_url} />
                      <AvatarFallback className="bg-black text-white text-xs">CR</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white">@{listing.creator.x_username}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span className="text-[10px] text-zinc-400 font-mono">★ {listing.creator.reputation_score}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {listing.creator.x_follower_count?.toLocaleString()} followers • {listing.creator.city}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                    "{listing.creator.bio}"
                  </p>

                  <div className="flex flex-wrap gap-1 font-mono">
                    {listing.creator.frequent_events.map((ev, i) => (
                      <span key={i} className="text-[10px] bg-black text-zinc-300 border border-white/10 px-2 py-0.5 rounded">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-zinc-300 mb-1">Exposure Context:</h4>
                  <p className="text-zinc-400 bg-zinc-950 p-2.5 rounded-lg border border-white/10">
                    {listing.exposure_context}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-300 mb-1">Creator Guidelines:</h4>
                  <p className="text-zinc-400 bg-zinc-950 p-2.5 rounded-lg border border-white/10">
                    {listing.requirements_text}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3.5 border-t border-white/10 flex flex-col gap-3">
              {error && (
                <div className="text-red-400 text-xs font-bold bg-red-500/10 p-2 rounded border border-red-500/20">
                  {error}
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">
                  {isAuction ? 'Current High Bid' : 'Price'}
                </span>
                <div className="text-2xl font-bold text-white font-mono">
                  ${isAuction 
                    ? listing.auction?.current_highest_bid 
                    : (selectedRoiIndex !== null && listing.rois && listing.rois[selectedRoiIndex].price !== undefined 
                        ? listing.rois[selectedRoiIndex].price 
                        : listing.price)} <span className="text-xs text-zinc-400">USDC</span>
                </div>
              </div>

              {isAuction ? (
                <Button
                  onClick={() => handleBuy('auction')}
                  className="bg-white hover:bg-zinc-200 text-black font-bold px-6 rounded-lg text-xs"
                >
                  <Gavel className="w-3.5 h-3.5 mr-1.5" />
                  Place Bid
                </Button>
              ) : (
                <Button
                  onClick={() => handleBuy('buy')}
                  className="bg-white hover:bg-zinc-200 text-black font-bold px-6 rounded-lg text-xs"
                >
                  Buy Now With Escrow
                </Button>
              )}
              </div>
            </div>

          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
};
