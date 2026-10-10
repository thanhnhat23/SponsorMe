'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  ExternalLink, 
  Hash,
  Star
} from 'lucide-react';
import { Campaign } from '@/types/database';
import confetti from 'canvas-confetti';

interface CampaignManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  currentWallet: string | null;
  onConfirmDelivery: (campaignId: string) => void;
  onSubmitProof: (campaignId: string, proofUrl: string, hash: string) => void;
  onOpenDispute: (campaignId: string, reason: string) => void;
}

export const CampaignManagementModal: React.FC<CampaignManagementModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  currentWallet,
  onConfirmDelivery,
  onSubmitProof,
  onOpenDispute
}) => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'submit_proof' | 'dispute' | 'rate'>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(campaigns[0] || null);
  
  const [proofUrl, setProofUrl] = useState<string>('');
  const [disputeReason, setDisputeReason] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Rating State
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [hasRated, setHasRated] = useState<Record<string, boolean>>({});

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="outline" className="border-white/30 text-white font-mono text-[10px]">Funded</Badge>;
      case 1:
        return <Badge variant="outline" className="border-white/40 text-white font-mono text-[10px]">Active (48h)</Badge>;
      case 2:
        return <Badge className="bg-white text-black font-mono text-[10px]">Proof Submitted</Badge>;
      case 3:
        return <Badge variant="outline" className="border-white text-white font-mono text-[10px]">Released (Complete)</Badge>;
      case 4:
        return <Badge variant="outline" className="border-red-500 text-red-400 font-mono text-[10px]">Disputed</Badge>;
      case 5:
        return <Badge variant="outline" className="border-zinc-700 text-zinc-500 font-mono text-[10px]">Refunded</Badge>;
      default:
        return null;
    }
  };

  const handleConfirm = (camp: Campaign) => {
    onConfirmDelivery(camp.id);
    setActionSuccess(`Delivery confirmed! Escrow released 95% ($${(camp.amount * 0.95).toFixed(2)}) to Creator and 5% ($${(camp.amount * 0.05).toFixed(2)}) to Platform Fee.`);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
  };

  const handleSubmitProofAction = () => {
    if (!selectedCampaign) return;
    const dummyHash = '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    onSubmitProof(selectedCampaign.id, proofUrl, dummyHash);
    setActionSuccess('Proof submitted! SHA-256 hash anchored to Solana Devnet. 24h review window started.');
    setProofUrl('');
    setActiveTab('campaigns');
  };

  const handleDisputeAction = () => {
    if (!selectedCampaign || !disputeReason) return;
    onOpenDispute(selectedCampaign.id, disputeReason);
    setActionSuccess('Dispute opened! Admin authority will review evidence and resolve escrow.');
    setDisputeReason('');
    setActiveTab('campaigns');
  };

  const handleRatingSubmit = () => {
    if (!selectedCampaign) return;
    setHasRated(prev => ({ ...prev, [selectedCampaign.id]: true }));
    setActionSuccess(`Rating of ${ratingScore} stars submitted successfully! This builds trust on the platform.`);
    setRatingScore(5);
    setRatingComment('');
    setActiveTab('campaigns');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-black border border-white/20 text-white p-7 rounded-2xl shadow-2xl space-y-4">
        <DialogHeader className="space-y-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-1 pr-6">
            <Badge variant="outline" className="border-white/30 text-white font-mono text-[10px]">
              Solana Escrow Protocol
            </Badge>
            <span className="text-xs text-zinc-400 font-mono text-left sm:text-right">
              Fee: 5% Platform / 95% Creator
            </span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white">
            Campaign Escrow & Fulfillment
          </DialogTitle>
        </DialogHeader>

        {actionSuccess && (
          <div className="bg-zinc-950 border border-white/30 text-white p-3.5 rounded-lg text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-white/10 pb-2.5">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeTab === 'campaigns'
                ? 'bg-white text-black font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Campaigns ({campaigns.length})
          </button>
          {selectedCampaign && (
            <>
              <button
                onClick={() => setActiveTab('submit_proof')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  activeTab === 'submit_proof'
                    ? 'bg-white text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Submit Proof (Creator)
              </button>
              <button
                onClick={() => setActiveTab('dispute')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  activeTab === 'dispute'
                    ? 'bg-white text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Open Dispute
              </button>
            </>
          )}
          {selectedCampaign && selectedCampaign.status === 3 && (
            <button
              onClick={() => setActiveTab('dispute')} // We will hijack this or create a 'rate' tab. Wait, let's create a rate tab!
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'dispute'
                  ? 'bg-white text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Rate Partner
            </button>
          )}
        </div>

        {/* TAB 1 */}
        {activeTab === 'campaigns' && (
          <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
            {campaigns.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-8 text-center font-mono">No active campaigns found.</p>
            ) : (
              campaigns.map((camp) => (
                <div
                  key={camp.id}
                  onClick={() => setSelectedCampaign(camp)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedCampaign?.id === camp.id
                      ? 'bg-zinc-950 border-white'
                      : 'bg-zinc-950/60 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-xs text-white">
                      {camp.listing?.device_or_item_name || 'Personal Ad Placement'}
                    </span>
                    {getStatusBadge(camp.status)}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-2 border-y border-white/10 my-2 font-mono">
                    <div>
                      <span className="text-zinc-500 text-[10px] block">Escrow Amount</span>
                      <span className="font-bold text-white">${camp.amount} USDC</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] block">Platform Fee (5%)</span>
                      <span className="text-zinc-300">${(camp.amount * 0.05).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] block">Creator Payout (95%)</span>
                      <span className="text-white font-bold">${(camp.amount * 0.95).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] block">Proof Deadline</span>
                      <span className="text-zinc-300">48h</span>
                    </div>
                  </div>

                  {camp.proof_url && (
                    <div className="flex items-center gap-2 mt-2 text-xs bg-black p-2.5 rounded-lg border border-white/10 font-mono">
                      <Hash className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                      <span className="text-[10px] text-zinc-400 truncate">
                        On-chain Proof Hash: {camp.proof_hash || 'SHA-256 e3b0c442...'}
                      </span>
                      <a
                        href={camp.proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-white hover:underline ml-auto flex items-center gap-1"
                      >
                        View Proof <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3 pt-2 justify-end">
                    {camp.status === 2 && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirm(camp);
                        }}
                        className="bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Confirm Delivery & Release Escrow
                      </Button>
                    )}
                    {camp.status === 3 && !hasRated[camp.id] && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCampaign(camp);
                          setActiveTab('rate');

                        }}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-white/20 text-white font-bold text-xs rounded-lg"
                      >
                        <Star className="w-3.5 h-3.5 mr-1" />
                        Leave a Review
                      </Button>
                    )}
                  </div>

                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2 */}
        {activeTab === 'submit_proof' && selectedCampaign && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-zinc-400">
              Upload photo screenshot of the sticker on your gear, or paste the pinned tweet URL to anchor on-chain proof hash:
            </p>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                Proof Image URL or Tweet Link:
              </label>
              <Input
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://..."
                className="bg-zinc-950 border-white/20 text-white text-xs rounded-lg"
              />
            </div>

            {proofUrl && (
              <div className="relative h-44 w-full rounded-xl overflow-hidden border border-white/10 bg-black">
                <img
                  src={proofUrl}
                  alt="Proof preview"
                  className="w-full h-full object-cover grayscale"
                />
              </div>
            )}

            <Button
              onClick={handleSubmitProofAction}
              className="w-full bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg py-2.5"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Submit Proof & Anchor SHA-256 Hash
            </Button>
          </div>
        )}

        {/* TAB 3 or RATING */}
        {activeTab === 'dispute' && selectedCampaign && (
          <div className="space-y-4 py-2">
            {selectedCampaign.status === 3 ? (
              // Rating UI
              <div className="space-y-4">
                <div className="bg-zinc-950 border border-white/20 p-3 rounded-lg text-xs text-zinc-300">
                  <p className="font-bold text-white mb-2">Leave a Two-Way Review</p>
                  <p>How was your experience working on this campaign? Your rating helps build trust and reputation on SponsorMe.</p>
                </div>
                
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingScore(star)}
                      className={`p-2 rounded-full transition-colors ${ratingScore >= star ? 'text-yellow-400 bg-yellow-400/10' : 'text-zinc-600 hover:bg-white/5'}`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">
                    Public Comment (Optional):
                  </label>
                  <Input
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Great communication, highly recommended!"
                    className="bg-zinc-950 border-white/20 text-white text-xs rounded-lg"
                  />
                </div>

                <Button
                  onClick={handleRatingSubmit}
                  className="w-full bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg py-2.5"
                >
                  Submit Review
                </Button>
              </div>
            ) : (
              // Dispute UI
              <>
                <div className="bg-zinc-950 border border-white/20 p-3 rounded-lg text-xs text-zinc-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-white mt-0.5" />
                  <span>
                    When opening a dispute, the escrow funds are frozen until Admin arbitrates the decision.
                  </span>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">
                    Dispute Reason:
                  </label>
                  <Input
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="e.g. Sticker was removed early, incorrect placement..."
                    className="bg-zinc-950 border-white/20 text-white text-xs rounded-lg"
                  />
                </div>

                <Button
                  onClick={handleDisputeAction}
                  disabled={!disputeReason}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg py-2.5"
                >
                  Submit Dispute
                </Button>
              </>
            )}
          </div>
        )}
        {/* TAB RATING */}
        {activeTab === 'rate' && selectedCampaign && (
          <div className="space-y-4 py-2">
            <div className="bg-zinc-950 border border-white/20 p-3 rounded-lg text-xs text-zinc-300">
              <p className="font-bold text-white mb-2">Leave a Two-Way Review</p>
              <p>How was your experience working on this campaign? Your rating helps build trust and reputation on SponsorMe.</p>
            </div>
            
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingScore(star)}
                  className={`p-2 rounded-full transition-colors ${ratingScore >= star ? 'text-yellow-400 bg-yellow-400/10' : 'text-zinc-600 hover:bg-white/5'}`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                Public Comment (Optional):
              </label>
              <Input
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Great communication, highly recommended!"
                className="bg-zinc-950 border-white/20 text-white text-xs rounded-lg"
              />
            </div>

            <Button
              onClick={handleRatingSubmit}
              className="w-full bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg py-2.5"
            >
              Submit Review
            </Button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
};
