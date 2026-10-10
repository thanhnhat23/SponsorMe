'use client';

import React from 'react';
import { Listing } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Laptop, 
  Luggage, 
  Shirt, 
  Share2, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  Maximize2,
  MapPin,
  Gavel
} from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  onOpenDetails: (listing: Listing) => void;
  onQuickBuy: (listing: Listing) => void;
  onOpenAuction: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onOpenDetails,
  onQuickBuy,
  onOpenAuction,
}) => {
  const isAuction = listing.listing_type === 1;
  const isPhysical = listing.ad_type === 2;

  const getCategoryIcon = () => {
    switch (listing.item_category) {
      case 'laptop':
        return Laptop;
      case 'suitcase':
        return Luggage;
      case 'hoodie':
      case 'backpack':
        return Shirt;
      case 'pinned_x':
      case 'x_bio':
        return Share2;
      default:
        return Sparkles;
    }
  };

  const Icon = getCategoryIcon();

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-sm border border-white/10 bg-zinc-950/80 hover:border-white/40 transition-all duration-200">
      
      {/* Visual Image Preview */}
      <div className="relative h-48 w-full overflow-hidden bg-black border-b border-white/10">
        <img
          src={listing.image_url || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'}
          alt={listing.device_or_item_name}
          className="h-full w-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300"
        />

        {listing.rois?.map((roi, index) => (
          <div
            key={index}
            className="absolute border border-dashed border-white/50 bg-white/10 z-10 group-hover:border-white group-hover:bg-white/30 transition-all duration-300 pointer-events-none"
            style={{
              left: `${roi.x}%`,
              top: `${roi.y}%`,
              width: `${roi.w}%`,
              height: `${roi.h}%`
            }}
          >
            {listing.rois!.length > 1 && (
              <div className="absolute -top-1.5 -left-1.5 bg-white text-black font-bold text-[6px] w-3 h-3 flex items-center justify-center rounded-full">
                {index + 1}
              </div>
            )}
          </div>
        ))}

        <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent pointer-events-none"></div>

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
          <Badge variant="outline" className="bg-black/80 backdrop-blur-md text-white border-white/20 text-[10px] font-mono flex items-center gap-1.5 py-0.5 px-2">
            <Icon className="w-3 h-3 text-zinc-400" />
            <span className="capitalize">{listing.item_category}</span>
          </Badge>

          {isAuction ? (
            <Badge className="bg-white text-black font-mono font-bold text-[10px] px-2 py-0.5 border-0">
              Auction
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-black/90 text-white font-mono text-[10px] px-2 py-0.5 border-white/30">
              Buy Now
            </Badge>
          )}
        </div>

        {/* Physical Dimension Overlay */}
        {isPhysical && listing.surface_area_cm2 && (
          <div className="absolute bottom-3 left-3.5">
            <span className="inline-flex items-center gap-1 bg-black/90 border border-white/20 rounded px-2 py-0.5 text-[10px] font-mono text-white">
              <Maximize2 className="w-3 h-3 text-zinc-400" />
              {listing.dimension_width_cm}x{listing.dimension_height_cm} cm ({listing.surface_area_cm2} cm²)
            </span>
          </div>
        )}

        {/* Impressions Estimate */}
        <div className="absolute bottom-3 right-3.5">
          <span className="inline-flex items-center gap-1 bg-black/90 border border-white/20 rounded px-2 py-0.5 text-[10px] font-mono text-zinc-300">
            <Eye className="w-3 h-3 text-zinc-400" />
            ~{listing.estimated_weekly_impressions.toLocaleString()} views
          </span>
        </div>
      </div>

      {/* Body Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          {/* Creator Profile Mini Bar */}
          {listing.creator && (
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-6 w-6 border border-white/20">
                  <AvatarImage src={listing.creator.x_avatar_url} />
                  <AvatarFallback className="text-[10px] bg-zinc-900 text-white">CR</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-white">
                      @{listing.creator.x_username}
                    </span>
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>

              {/* Creator Rating Score */}
              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded border border-white/10">
                  ★ {listing.creator.reputation_score.toFixed(1)}
                </span>
              </div>
            </div>
          )}

          {/* Item Name & Specific Placement */}
          <h3 className="font-bold text-sm text-white group-hover:underline underline-offset-4 transition-colors line-clamp-1">
            {listing.device_or_item_name}
          </h3>

          <p className="text-xs text-zinc-300 font-medium mt-1 line-clamp-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-zinc-400 flex-shrink-0" />
            Spot: {listing.placement_location}
          </p>

          <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed font-normal">
            {listing.exposure_context}
          </p>

          {/* Target Niche Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {listing.target_niche.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-white/5"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing & Call to Actions */}
        <div className="pt-3 border-t border-white/10 space-y-3">
          
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">
                {isAuction ? 'Current High Bid' : 'Price (USDC)'}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white font-mono">
                  ${isAuction ? listing.auction?.current_highest_bid : listing.price}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">USDC</span>
              </div>
            </div>

            {isAuction && listing.auction && (
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 font-mono">
                  18h 42m left
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenDetails(listing)}
              className="border-white/15 text-zinc-200 hover:text-white hover:bg-zinc-900 text-xs rounded-lg font-medium"
            >
              Inspect
            </Button>

            {isAuction ? (
              <Button
                size="sm"
                onClick={() => onOpenAuction(listing)}
                className="bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-lg transition-colors border border-white"
              >
                <Gavel className="w-3 h-3 mr-1" />
                Place Bid
              </Button>
            ) : listing.rois && listing.rois.length > 0 ? (
              <Button
                size="sm"
                onClick={() => onOpenDetails(listing)}
                className="bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-lg transition-colors border border-white"
              >
                Select Spot
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => onQuickBuy(listing)}
                className="bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-lg transition-colors border border-white"
              >
                Buy Now
              </Button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
