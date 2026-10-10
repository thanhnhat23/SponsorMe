'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Laptop, 
  Luggage, 
  Shirt, 
  Share2, 
  Gavel, 
  DollarSign, 
  ArrowRight, 
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { Listing, ItemCategory, AdType, ListingType } from '@/types/database';
import { ImageRegionSelector, ROI } from './ImageRegionSelector';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWallet: string | null;
  onListingCreated: (newListing: Listing) => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  currentWallet,
  onListingCreated
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [itemCategory, setItemCategory] = useState<ItemCategory>('laptop');
  const [adType, setAdType] = useState<AdType>(2);
  const [listingType, setListingType] = useState<ListingType>(0);
  const [price, setPrice] = useState<number | ''>('');
  const [deviceName, setDeviceName] = useState<string>('');
  const [placementLocation, setPlacementLocation] = useState<string>('');
  const [widthCm, setWidthCm] = useState<number | ''>('');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [exposureContext, setExposureContext] = useState<string>('');
  const [requirements, setRequirements] = useState<string>('');
  const [xPostId, setXPostId] = useState<string>('');
  const [rois, setRois] = useState<ROI[]>([]);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const previewImage = uploadedImage || 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&auto=format&fit=crop&q=80';

  const handleNext = () => {
    if (step === 1 && !uploadedImage) {
      setError('Please upload an image of the item you want to list!');
      return;
    }
    if (step === 2) {
      if (price === '' || Number(price) <= 0) {
        setError('Please enter a valid price greater than 0!');
        return;
      }
    }
    if (step === 3) {
      if (!deviceName || !placementLocation) {
        setError('Please enter both device name and placement spot!');
        return;
      }
      if (itemCategory !== 'pinned_x') {
        if (widthCm === '' || heightCm === '' || Number(widthCm) <= 0 || Number(heightCm) <= 0) {
          setError('Please enter valid dimensions (width and height)!');
          return;
        }
        if (rois.length === 0) {
          setError('Please draw at least one spot on the image!');
          return;
        }
      }
      if (!exposureContext) {
        setError('Please enter the exposure context!');
        return;
      }
    }
    setError(null);
    setStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!currentWallet) {
      setError('Please connect your Solana wallet (Phantom or Solflare) before creating on-chain listing!');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      const surfaceArea = Number(((Number(widthCm) || 0) * (Number(heightCm) || 0)).toFixed(1));
      const created: Listing = {
        id: `list-${Date.now()}`,
        on_chain_address: `${Math.random().toString(36).substring(2, 9)}...ListingPDA`,
        creator_wallet: currentWallet,
        ad_type: adType,
        listing_type: listingType,
        price: Number(price) || 0,
        item_category: itemCategory,
        device_or_item_name: deviceName,
        placement_location: placementLocation,
        dimension_width_cm: Number(widthCm) || 0,
        dimension_height_cm: Number(heightCm) || 0,
        surface_area_cm2: surfaceArea,
        exposure_context: exposureContext,
        target_niche: ['Tech', 'Dev', 'Students'],
        estimated_weekly_impressions: 3000,
        requirements_text: requirements,
        status: 0,
        x_post_id: itemCategory === 'pinned_x' && xPostId ? xPostId : undefined,
        rois: rois.length > 0 ? rois : undefined,
        created_at: new Date().toISOString(),
        image_url: previewImage
      };

      if (listingType === 1) {
        created.auction = {
          id: `auc-${Date.now()}`,
          on_chain_address: `${Math.random().toString(36).substring(2, 9)}...AuctionPDA`,
          listing_id: created.id,
          starting_price: Number(price) || 0,
          current_highest_bid: Number(price) || 0,
          end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 0,
          bids: []
        };
      }

      onListingCreated(created);
      
      // Reset form states
      setStep(1);
      setItemCategory('laptop');
      setAdType(2);
      setListingType(0);
      setPrice('');
      setDeviceName('');
      setPlacementLocation('');
      setWidthCm('');
      setHeightCm('');
      setExposureContext('');
      setRequirements('');
      setXPostId('');
      setRois([]);
      setUploadedImage(null);

      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black border border-white/20 text-white p-7 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-1 pr-6">
            <span className="text-xs font-mono text-zinc-400">
              STEP {step}/4: {step === 1 ? 'SELECT CATEGORY' : step === 2 ? 'TYPE & PRICING' : step === 3 ? 'DIMENSIONS & SPOT' : 'CONFIRM ON-CHAIN'}
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 w-6 rounded-full transition-colors ${
                    i <= step ? 'bg-white' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white">
            List Sponsorship Placement
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-zinc-950 border border-red-500/30 text-red-300 p-3 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-3 py-2">
            <p className="text-xs text-zinc-400">
              Upload an image of the physical surface or digital slot you want to sell:
            </p>

            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center bg-zinc-950 hover:bg-zinc-900 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setUploadedImage(reader.result as string);
                      setItemCategory('other');
                      setAdType(2);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {uploadedImage ? (
                <div className="relative w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
                  <img src={uploadedImage} alt="Uploaded item" className="w-full h-auto max-h-64 object-contain" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-bold">Click to change image</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-white/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Laptop className="w-6 h-6 text-zinc-300" />
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">Click to Upload Image</h4>
                  <p className="text-xs text-zinc-500">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setListingType(0)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  listingType === 0
                    ? 'bg-white text-black border-white'
                    : 'bg-zinc-950 border-white/10 text-zinc-300'
                }`}
              >
                <DollarSign className="w-4 h-4 mb-1" />
                <h4 className="font-bold text-xs">Buy Now (Fixed)</h4>
                <p className={`text-[11px] mt-0.5 ${listingType === 0 ? 'text-zinc-700' : 'text-zinc-500'}`}>
                  Advertiser funds escrow to immediately lock deal.
                </p>
              </button>

              <button
                onClick={() => setListingType(1)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  listingType === 1
                    ? 'bg-white text-black border-white'
                    : 'bg-zinc-950 border-white/10 text-zinc-300'
                }`}
              >
                <Gavel className="w-4 h-4 mb-1" />
                <h4 className="font-bold text-xs">Auction (English)</h4>
                <p className={`text-[11px] mt-0.5 ${listingType === 1 ? 'text-zinc-700' : 'text-zinc-500'}`}>
                  24h bidding with +5% minimum increment.
                </p>
              </button>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                {listingType === 0 ? 'Fixed Price ($ USDC):' : 'Starting Bid Floor ($ USDC):'}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  min={5}
                  max={500}
                  className="bg-zinc-950 border-white/20 text-white text-lg font-mono font-bold rounded-lg"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">
                  USDC
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                Recommendation: Placements under $35 receive the fastest response from indie brands.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-3.5 py-2">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                Device / Item Name:
              </label>
              <Input
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g. MacBook Pro 14 M3, Rimowa Cabin..."
                className="bg-zinc-950 border-white/20 text-white text-xs rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                Exact Surface Placement:
              </label>
              <Input
                value={placementLocation}
                onChange={(e) => setPlacementLocation(e.target.value)}
                placeholder="e.g. Center Laptop Lid, Bottom Right..."
                className="bg-zinc-950 border-white/20 text-white text-xs rounded-lg"
              />
            </div>

            {itemCategory !== 'pinned_x' && (
              <div className="pt-2 space-y-4">
                <ImageRegionSelector
                  imageUrl={previewImage}
                  rois={rois}
                  onChange={setRois}
                />
                
                {rois.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400 block">Set price per spot (Optional, overrides base price):</label>
                    <div className="grid grid-cols-2 gap-2">
                      {rois.map((roi, index) => (
                        <div key={roi.id || index} className="flex items-center gap-2">
                          <div className="bg-white text-black font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full shrink-0">
                            {index + 1}
                          </div>
                          <div className="relative flex-1">
                            <Input
                              type="number"
                              value={roi.price !== undefined ? roi.price : ''}
                              onChange={(e) => {
                                const newRois = [...rois];
                                newRois[index].price = e.target.value ? Number(e.target.value) : undefined;
                                setRois(newRois);
                              }}
                              placeholder={`$${price || 0}`}
                              className="bg-zinc-950 border-white/20 text-white text-xs h-8 rounded-md"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400">USDC</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {itemCategory !== 'pinned_x' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">
                    Sticker Width (cm):
                  </label>
                  <Input
                    type="number"
                    value={widthCm}
                    onChange={(e) => setWidthCm(e.target.value === '' ? '' : Number(e.target.value))}
                    step="0.5"
                    className="bg-zinc-950 border-white/20 text-white font-mono text-xs rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">
                    Sticker Height (cm):
                  </label>
                  <Input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
                    step="0.5"
                    className="bg-zinc-950 border-white/20 text-white font-mono text-xs rounded-lg"
                  />
                </div>
              </div>
            )}

            {itemCategory === 'pinned_x' && (
              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Tweet ID or Link (Optional):
                </label>
                <Input
                  value={xPostId}
                  onChange={(e) => {
                    const val = e.target.value;
                    const match = val.match(/status\/(\d+)/);
                    setXPostId(match ? match[1] : val);
                  }}
                  placeholder="e.g. 1742918809983693156 or https://x.com/..."
                  className="bg-zinc-950 border-white/20 text-white text-xs rounded-lg"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                Exposure Context & Routine:
              </label>
              <Input
                value={exposureContext}
                onChange={(e) => setExposureContext(e.target.value)}
                placeholder="e.g. Working at tech coffee hubs & attending Solana Breakpoint..."
                className="bg-zinc-950 border-white/20 text-white text-xs rounded-lg"
              />
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-3.5 py-2 font-mono text-xs">
            <div className="bg-zinc-950 border border-white/10 rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Device:</span>
                <span className="text-white">{deviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Placement:</span>
                <span className="text-white">{placementLocation}</span>
              </div>
              {itemCategory !== 'pinned_x' && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Dimensions:</span>
                  <span className="text-white">{widthCm || 0}x{heightCm || 0} cm ({(Number(widthCm) || 0) * (Number(heightCm) || 0)} cm²)</span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-zinc-500">Listing Price:</span>
                <span className="font-bold text-white text-sm">${price || 0} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Creator Net Payout (95%):</span>
                <span className="text-white font-bold">${((Number(price) || 0) * 0.95).toFixed(2)} USDC</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 bg-zinc-950 p-3 rounded-lg border border-white/10">
              When confirmed, a Listing PDA will be created on Solana Devnet and indexed to the Supabase database.
            </p>
          </div>
        )}

        {/* Modal Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={isSubmitting}
              className="border-white/20 text-white rounded-lg text-xs"
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-white hover:bg-zinc-200 text-black font-bold rounded-lg text-xs"
            >
              <FileCheck2 className="w-3.5 h-3.5 mr-1" />
              {isSubmitting ? 'Signing PDA...' : 'Sign On-Chain Listing'}
            </Button>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
};
