'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Laptop, 
  Luggage, 
  Shirt, 
  Share2, 
  Sparkles, 
  SlidersHorizontal 
} from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedPriceFilter: string;
  setSelectedPriceFilter: (p: string) => void;
  selectedType: string;
  setSelectedType: (t: string) => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedPriceFilter,
  setSelectedPriceFilter,
  selectedType,
  setSelectedType,
  totalResults
}) => {
  const categories = [
    { id: 'all', label: 'All Placements', icon: Sparkles },
    { id: 'laptop', label: 'Laptop Lid', icon: Laptop },
    { id: 'suitcase', label: 'Suitcase / Luggage', icon: Luggage },
    { id: 'hoodie', label: 'Apparel & Bag', icon: Shirt },
    { id: 'pinned_x', label: 'X (Twitter) Pinned', icon: Share2 },
  ];

  const priceRanges = [
    { id: 'all', label: 'Any Price' },
    { id: 'under_15', label: '< $15' },
    { id: 'under_30', label: '< $30' },
    { id: 'under_50', label: '< $50' },
  ];

  const listingTypes = [
    { id: 'all', label: 'All Formats' },
    { id: 'fixed', label: 'Buy Now' },
    { id: 'auction', label: 'Auction' },
  ];

  return (
    <div className="space-y-5">
      
      {/* Search Input & Counter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search device (MacBook, Rimowa), location (Breakpoint, Tech Hub)..."
            className="pl-10 h-10 bg-zinc-950 border-white/15 text-white placeholder:text-zinc-600 rounded-lg focus:border-white font-sans text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs text-zinc-400 font-mono">
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
          <span>Showing <strong className="text-white">{totalResults}</strong> available placements</span>
        </div>

      </div>

      {/* Category Pills & Sub Filters Container */}
      <div className="flex flex-col gap-3 pt-1 w-full overflow-hidden">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border flex-shrink-0 ${
                  isActive
                    ? 'bg-white text-black border-white shadow-sm font-semibold'
                    : 'bg-zinc-950 border-white/10 text-zinc-400 hover:text-white hover:border-white/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Sub Filters: Price & Type in one clean line */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono w-full">
          
          <div className="flex items-center gap-1.5 border border-white/10 rounded-lg p-1 bg-zinc-950">
            {priceRanges.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPriceFilter(p.id)}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                  selectedPriceFilter === p.id
                    ? 'bg-white text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 border border-white/10 rounded-lg p-1 bg-zinc-950">
            {listingTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                  selectedType === t.id
                    ? 'bg-white text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
