import React, { useState, useEffect } from 'react';
import { X, Search, Briefcase, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Bounty } from '@/types/database';

export const BountyBoardModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchBounties();
    }
  }, [isOpen]);

  const fetchBounties = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bounties')
      .select('*, advertiser:users!bounties_advertiser_wallet_fkey(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBounties(data);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slideUp">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-zinc-400" />
              Reverse Market (Bounties)
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Advertisers post budgets. Creators apply.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search bounties..." 
                className="w-full bg-black border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white focus:border-white transition-colors"
              />
            </div>
            <Button className="bg-white text-black font-semibold text-xs h-9">
              Post a Bounty
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <p className="text-white text-xs font-mono p-4">Loading bounties from Supabase...</p>
            ) : bounties.length === 0 ? (
              <p className="text-zinc-500 text-xs font-mono p-4">No bounties found.</p>
            ) : (
              bounties.map((b) => (
                <div key={b.id} className="bg-black border border-white/10 rounded-xl p-5 hover:border-white/30 transition-colors">
                  <h3 className="text-sm font-bold text-white">{b.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1">by {b.advertiser?.x_username || b.advertiser_wallet.slice(0, 8)}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="bg-zinc-900 border border-white/5 rounded-md px-2.5 py-1 flex items-center gap-1.5 text-xs">
                      <DollarSign className="w-3.5 h-3.5 text-green-400" />
                      <span className="font-mono text-white">${b.budget} USDC</span>
                    </div>
                    <div className="bg-zinc-900 border border-white/5 rounded-md px-2.5 py-1 flex items-center gap-1.5 text-xs">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-mono text-white">{b.applicants_count} Applied</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 mt-4 line-clamp-2">
                    {b.requirements_text}
                  </p>

                  <div className="mt-5 pt-4 border-t border-white/5 flex justify-end">
                    <Button variant="outline" className="h-8 text-xs border-white/20 text-white hover:bg-white hover:text-black">
                      Apply Now
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
