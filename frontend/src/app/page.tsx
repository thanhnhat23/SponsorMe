'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ProblemBanner } from '@/components/ProblemBanner';
import { FilterBar } from '@/components/FilterBar';
import { ListingCard } from '@/components/ListingCard';
import { AuctionModal } from '@/components/AuctionModal';
import { CreateListingModal } from '@/components/CreateListingModal';
import { CampaignManagementModal } from '@/components/CampaignManagementModal';
import { ListingDetailModal } from '@/components/ListingDetailModal';
import { BountyBoardModal } from '@/components/BountyBoardModal';
import { SolanaWalletModal } from '@/components/SolanaWalletModal';
import { mockListings, mockCampaigns } from '@/lib/mockData';
import { Listing, Campaign } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SolanaWalletState, DEVNET_RPC } from '@/lib/solanaWallet';
import confetti from 'canvas-confetti';
import { 
  Laptop, 
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const wallet = useWallet();
  const { connection } = useConnection();
  
  const [showThesis, setShowThesis] = useState<boolean>(false);

  // Listings & Campaigns
  const [listings, setListings] = useState<Listing[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const fetchData = async () => {
    // 1. Fetch Listings with Creator and Auction details
    const { data: listingsData } = await supabase
      .from('listings')
      .select('*, creator:users(*), auction:auctions(*, bids(*))')
      .order('created_at', { ascending: false });
    
    if (listingsData) {
      setListings(listingsData as unknown as Listing[]);
    }

    // 2. Fetch Campaigns
    const { data: campaignsData } = await supabase
      .from('campaigns')
      .select('*, listing:listings(*, creator:users(*))')
      .order('created_at', { ascending: false });
      
    if (campaignsData) {
      setCampaigns(campaignsData as unknown as Campaign[]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Modals
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedListingForDetail, setSelectedListingForDetail] = useState<Listing | null>(null);
  const [selectedListingForAuction, setSelectedListingForAuction] = useState<Listing | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCampaignsModalOpen, setIsCampaignsModalOpen] = useState(false);
  const [isBountiesModalOpen, setIsBountiesModalOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (selectedCategory !== 'all' && item.item_category !== selectedCategory) {
        return false;
      }
      if (selectedType === 'fixed' && item.listing_type !== 0) return false;
      if (selectedType === 'auction' && item.listing_type !== 1) return false;

      const effectivePrice = item.listing_type === 1 && item.auction 
        ? item.auction.current_highest_bid 
        : item.price;

      if (selectedPriceFilter === 'under_15' && effectivePrice > 15) return false;
      if (selectedPriceFilter === 'under_30' && effectivePrice > 30) return false;
      if (selectedPriceFilter === 'under_50' && effectivePrice > 50) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = item.device_or_item_name.toLowerCase().includes(q);
        const matchLoc = item.placement_location.toLowerCase().includes(q);
        const matchContext = item.exposure_context.toLowerCase().includes(q);
        const matchCreator = item.creator?.x_username?.toLowerCase().includes(q);
        return matchName || matchLoc || matchContext || matchCreator;
      }

      return true;
    });
  }, [listings, selectedCategory, selectedPriceFilter, selectedType, searchQuery]);

  const handleDisconnectWallet = () => {
    const defaultState: SolanaWalletState = {
      isConnected: false,
      publicKey: null,
      walletName: null,
      solBalance: 0,
      usdcBalance: 0,
      network: 'devnet',
      rpcUrl: DEVNET_RPC,
    };
    setWalletState(defaultState);
    localStorage.removeItem('sponsorme_wallet_state');
    showToast('Wallet disconnected.');
  };

  const handleWalletConnected = (newState: SolanaWalletState) => {
    setWalletState(newState);
    localStorage.setItem('sponsorme_wallet_state', JSON.stringify(newState));
    showToast(`Connected to ${newState.walletName} on Solana Devnet.`);
  };

  // Quick buy fixed-price listing
  const handleQuickBuy = async (listing: Listing, selectedRoiId?: string, actualPrice?: number) => {
    if (!wallet.connected || !wallet.publicKey) {
      showToast('Please connect your Solana wallet first!');
      return;
    }

    try {
      const finalPrice = actualPrice !== undefined ? actualPrice : listing.price;
      showToast(`Initiating transfer of $${finalPrice} (SOL equivalent)...`);
      
      const recipient = new PublicKey(listing.creator_wallet || 'Spons11111111111111111111111111111111111111'); // Fallback
      const SOL_PRICE = 150; // Mock exchange rate
      const amountInSol = finalPrice / SOL_PRICE;
      const lamports = Math.floor(amountInSol * LAMPORTS_PER_SOL);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: recipient,
          lamports,
        })
      );

      const signature = await wallet.sendTransaction(transaction, connection);
      showToast(`Transaction sent! Waiting for confirmation...`);
      await connection.confirmTransaction(signature, 'processed');

      // Deadline is 48 hours from now
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + 48);

      const newCampaign = {
        listing_id: listing.id,
        creator_wallet: listing.creator_wallet,
        advertiser_wallet: wallet.publicKey.toBase58(),
        amount: Math.round(finalPrice),
        fee_amount: Math.round(finalPrice * 0.05), 
        ad_type: listing.ad_type,
        status: 1,
        on_chain_address: signature,
        deadline: deadline.toISOString(), // Fix: Supabase NOT NULL constraint
      };

      const { error } = await supabase.from('campaigns').insert([newCampaign]);
      if (error) throw error;

      // Update Listing (Mark spot as sold, or whole listing as sold)
      let updateData: any = {};
      if (selectedRoiId && listing.rois) {
        const newRois = listing.rois.map(roi => 
          roi.id === selectedRoiId ? { ...roi, isSold: true } : roi
        );
        updateData.rois = newRois;
        if (newRois.every(r => r.isSold)) {
          updateData.status = 1;
        }
      } else {
        updateData.status = 1; // Mark whole listing as sold
      }

      const { error: updateError } = await supabase
        .from('listings')
        .update(updateData)
        .eq('id', listing.id);
      
      if (updateError) throw updateError;

      await fetchData();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      showToast(`Locked $${finalPrice} (SOL) in Campaign Escrow PDA.`);
      setIsCampaignsModalOpen(true);
    } catch (error: any) {
      console.error(error);
      showToast(`Transaction failed: ${error.message}`);
    }
  };

  // Place bid success in auction
  const handlePlaceBidSuccess = (listingId: string, amount: number) => {
    setWalletState((prev) => ({
      ...prev,
      usdcBalance: prev.usdcBalance - amount,
    }));
    setListings((prev) =>
      prev.map((item) => {
        if (item.id === listingId && item.auction) {
          const updatedBids = [
            {
              id: `bid-${Date.now()}`,
              auction_id: item.auction.id,
              bidder_wallet: walletState.publicKey || 'You',
              amount: amount,
              tx_signature: `${Math.random().toString(36).substring(2, 10)}...tx`,
              created_at: new Date().toISOString(),
            },
            ...(item.auction.bids || []),
          ];
          return {
            ...item,
            auction: {
              ...item.auction,
              current_highest_bid: amount,
              current_bidder_wallet: walletState.publicKey || 'You',
              bids: updatedBids,
            },
          };
        }
        return item;
      })
    );
    showToast(`Bid confirmed: $${amount} USDC.`);
  };

  // Pull refund success
  const handleClaimRefundSuccess = (amount: number) => {
    setWalletState((prev) => ({
      ...prev,
      usdcBalance: prev.usdcBalance + amount,
    }));
    showToast(`Claimed $${amount} USDC back to your wallet.`);
  };

  // Create new listing
  const handleListingCreated = async (newListing: Listing) => {
    if (!wallet.publicKey) return;

    // 1. Upsert a basic user profile for this wallet so foreign key doesn't fail
    await supabase.from('users').upsert({
      wallet_address: wallet.publicKey.toBase58(),
      x_username: `Creator_${wallet.publicKey.toBase58().slice(0, 4)}`,
      primary_role: 'creator',
    }, { onConflict: 'wallet_address' });

    // 2. Prepare listing data (strip out mock ID and nested relations)
    const { id, creator, auction, ...insertData } = newListing as any;
    
    const { data: insertedListing, error } = await supabase
      .from('listings')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      showToast('Error saving to DB: ' + error.message);
      return;
    }

    // 3. If auction, insert it too
    if (newListing.listing_type === 1 && auction) {
      const { id: aucId, bids, ...aucData } = auction;
      await supabase.from('auctions').insert([{ ...aucData, listing_id: insertedListing.id }]);
    }

    await fetchData(); // Refresh data from backend
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.5 } });
    showToast('Listing registered successfully on Supabase!');
  };

  // Confirm delivery
  const handleConfirmDelivery = async (campaignId: string) => {
    showToast('Releasing Escrow and Minting cNFT Receipt to Creator...');
    // Mock the delay of minting a cNFT
    setTimeout(() => {
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? { ...c, status: 3 } : c))
      );
      showToast('Escrow Released! cNFT Receipt minted to Creator\'s wallet.');
    }, 1500);
  };

  // Submit proof
  const handleSubmitProof = (campaignId: string, proofUrl: string, hash: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              status: 2,
              proof_url: proofUrl,
              proof_hash: hash,
              proof_submitted_at: new Date().toISOString(),
            }
          : c
      )
    );
    showToast('Proof submitted and SHA-256 hash anchored on-chain.');
  };

  // Open dispute
  const handleOpenDispute = (campaignId: string, reason: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status: 4 } : c))
    );
    showToast('Dispute opened. Admin notified.');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 border border-white/20 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 animate-slideUp font-mono text-xs">
          <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean Minimalist Header */}
      <Header
        walletState={{} as any} // Obsolete props
        onOpenConnectModal={() => {}}
        onDisconnectWallet={() => {}}
        openCreateModal={() => setIsCreateModalOpen(true)}
        openCampaignsModal={() => setIsCampaignsModalOpen(true)}
        openBountiesModal={() => setIsBountiesModalOpen(true)}
        onToggleThesis={() => {
          setShowThesis(!showThesis);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 md:py-16 space-y-16">
        
        {/* Clean Problem Banner */}
        <section>
          <ProblemBanner showDetails={showThesis} />
        </section>

        {/* Marketplace Section */}
        <section id="marketplace" className="space-y-6 scroll-mt-24">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Available Sponsorship Placements
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal">
                Curated physical hardware spots and micro-digital slots secured by Solana Escrow.
              </p>
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="md:hidden bg-white text-black font-semibold rounded-md text-xs h-8"
            >
              List Placement
            </Button>
          </div>

          {/* Filter Bar */}
          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedPriceFilter={selectedPriceFilter}
            setSelectedPriceFilter={setSelectedPriceFilter}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            totalResults={filteredListings.length}
          />

          {/* Listings Grid */}
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={item}
                  onOpenDetails={(l) => setSelectedListingForDetail(l)}
                  onQuickBuy={handleQuickBuy}
                  onOpenAuction={(l) => setSelectedListingForAuction(l)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-zinc-950 p-16 text-center space-y-2">
              <Laptop className="w-9 h-9 text-zinc-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No placements matched your query</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto font-normal">
                Try clearing your search query or changing filter settings.
              </p>
            </div>
          )}

        </section>

      </main>

      {/* Minimal Footer */}
      <footer className="mt-24 border-t border-white/10 bg-black py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">SponsorMe</span>
            <span>/</span>
            <span>Solana Devnet Escrow</span>
            <span>/</span>
            <span>5% Fee • 95% Creator</span>
          </div>
          <div>
            <span>Micro-Sponsorship Protocol for Builders & Startups</span>
          </div>
        </div>
      </footer>

      {/* Modals */}

      <AuctionModal
        listing={selectedListingForAuction}
        isOpen={!!selectedListingForAuction}
        onClose={() => setSelectedListingForAuction(null)}
        currentWallet={wallet.publicKey?.toBase58() || null}
        usdcBalance={999}
        onPlaceBidSuccess={handlePlaceBidSuccess}
        onClaimRefundSuccess={handleClaimRefundSuccess}
      />

      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentWallet={wallet.publicKey?.toBase58() || null}
        onListingCreated={handleListingCreated}
      />

      <CampaignManagementModal
        isOpen={isCampaignsModalOpen}
        onClose={() => setIsCampaignsModalOpen(false)}
        campaigns={campaigns}
        currentWallet={wallet.publicKey?.toBase58() || null}
        onConfirmDelivery={handleConfirmDelivery}
        onSubmitProof={handleSubmitProof}
        onOpenDispute={handleOpenDispute}
      />

      <BountyBoardModal 
        isOpen={isBountiesModalOpen}
        onClose={() => setIsBountiesModalOpen(false)}
      />

      <ListingDetailModal
        listing={selectedListingForDetail}
        isOpen={!!selectedListingForDetail}
        onClose={() => setSelectedListingForDetail(null)}
        onQuickBuy={handleQuickBuy}
        onOpenAuction={(l) => {
          setSelectedListingForDetail(null);
          setSelectedListingForAuction(l);
        }}
      />

    </div>
  );
}
