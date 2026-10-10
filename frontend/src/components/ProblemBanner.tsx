'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface ProblemBannerProps {
  showDetails?: boolean;
}

export const ProblemBanner: React.FC<ProblemBannerProps> = ({ showDetails = false }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8 sm:p-10 transition-all">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Headline & Intro */}
        <div className="lg:col-span-7 space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Turn Laptop Lids & Suitcases Into Personal Billboards.
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl font-normal">
            Directly sponsor developers, students, and digital nomads carrying your sticker to hackathons, tech conferences, and coffee shops for <span className="text-white font-medium underline decoration-white/30 underline-offset-4">$10 to $35</span>.
          </p>
        </div>

        {/* Right Comparison Card */}
        <div className="lg:col-span-5 bg-black border border-white/10 rounded-xl p-5 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="uppercase text-[11px] text-zinc-400">
              SponsorMe vs Traditional Ads
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Customer Acquisition Cost</span>
              <span className="text-white font-bold">$10 – $45 (-85%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Escrow Guarantee</span>
              <span className="text-white font-bold">Solana PDA Program</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Revenue Split</span>
              <span className="text-zinc-300 font-bold">5% Platform / 95% Creator</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Proof Verification</span>
              <span className="text-white font-bold">SHA-256 On-Chain Hash</span>
            </div>
          </div>
        </div>

      </div>

      {/* Expanded Thesis if requested */}
      {showDetails && (
        <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          
          <div className="bg-black border border-white/10 rounded-xl p-5 space-y-2">
            <span className="text-xs font-mono text-zinc-500">01</span>
            <h3 className="text-sm font-bold text-white">Under $50 Placements</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tailored for micro-budgets where creators earn coffee allowance, while early-stage founders get real-world visibility without paying $5k+ booth fees.
            </p>
          </div>

          <div className="bg-black border border-white/10 rounded-xl p-5 space-y-2">
            <span className="text-xs font-mono text-zinc-500">02</span>
            <h3 className="text-sm font-bold text-white">Quantifiable Surface Area</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Standardized dimensions (cm²), verified hardware model (MacBook M3, Rimowa), exposure location, and targeted peer-to-peer niche audience matching.
            </p>
          </div>

          <div className="bg-black border border-white/10 rounded-xl p-5 space-y-2">
            <span className="text-xs font-mono text-zinc-500">03</span>
            <h3 className="text-sm font-bold text-white">Trustless English Auction</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Competitive 24h auction (+5% increment) for high-impact speaker laptops. Locked in Solana USDC escrow with a 24h review window before payout.
            </p>
          </div>

        </div>
      )}
    </div>
  );
};
