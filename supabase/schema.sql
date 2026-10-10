-- ==============================================================================
-- SponsorMe — Supabase PostgreSQL Database Schema
-- Spec Version: v1 (Off-chain Indexer DB + Enhanced Inventory Profile Matching)
-- Conforms to: Supabase Postgres Best Practices & Security Guidelines
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS (Profiles of Creators & Advertisers)
CREATE TABLE IF NOT EXISTS public.users (
    wallet_address TEXT PRIMARY KEY,
    x_user_id TEXT UNIQUE,
    x_username TEXT,
    x_avatar_url TEXT,
    x_follower_count INTEGER DEFAULT 0,
    bio TEXT,
    primary_role TEXT CHECK (primary_role IN ('creator', 'advertiser', 'both', 'admin')) DEFAULT 'creator',
    skills_or_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    frequent_events TEXT[] DEFAULT ARRAY[]::TEXT[], -- e.g. ['Solana Breakpoint', 'Hackathon HCM', 'VietDX']
    city TEXT,
    reputation_score NUMERIC(3, 2) DEFAULT 5.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for searching creators by social presence and rating
CREATE INDEX IF NOT EXISTS idx_users_follower_count ON public.users (x_follower_count DESC);
CREATE INDEX IF NOT EXISTS idx_users_reputation ON public.users (reputation_score DESC);

-- 3. LISTINGS (Products & Ad Placements: Physical surfaces & Digital slots)
-- ad_type: 0 = SponsoredPost (X), 1 = PinnedPost (X), 2 = PhysicalBanner/Sticker (Laptop, Suitcase, etc.)
-- listing_type: 0 = Fixed Price, 1 = Auction
-- status: 0 = Active, 1 = Sold/Closed, 2 = Cancelled
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    on_chain_address TEXT UNIQUE, -- Solana Listing PDA
    creator_wallet TEXT NOT NULL REFERENCES public.users(wallet_address) ON DELETE CASCADE,
    
    -- Categorization & Pricing
    ad_type SMALLINT NOT NULL CHECK (ad_type IN (0, 1, 2)),
    listing_type SMALLINT NOT NULL CHECK (listing_type IN (0, 1)),
    price BIGINT NOT NULL CHECK (price >= 0), -- Stored in micro-USDC (6 decimals, e.g. 20_000_000 = $20 USDC)
    
    -- Physical & Digital Inventory Details (Detailed Problem Solving Attributes)
    item_category TEXT NOT NULL CHECK (item_category IN ('laptop', 'suitcase', 'hoodie', 'backpack', 'pinned_x', 'x_bio', 'combo', 'other')),
    device_or_item_name TEXT NOT NULL, -- e.g. 'Apple MacBook Pro 16" M3 Space Black', 'Rimowa Cabin Luggage 21"'
    placement_location TEXT NOT NULL,  -- e.g. 'Nắp lưng trung tâm (Center Laptop Lid)', 'Góc trên bên phải', 'Mặt trước vali'
    dimension_width_cm NUMERIC(5, 2),  -- e.g. 6.00 cm
    dimension_height_cm NUMERIC(5, 2), -- e.g. 6.00 cm
    surface_area_cm2 NUMERIC(7, 2),    -- e.g. 36.00 cm2
    
    -- Target Matching & Audience Reach
    exposure_context TEXT,              -- e.g. 'Mang laptop đi làm việc hàng ngày tại ĐHQG & The Coffee House Q1, tham dự Hackathon'
    target_niche TEXT[] DEFAULT ARRAY[]::TEXT[], -- e.g. ['Developers', 'Web3', 'AI', 'Students']
    estimated_weekly_impressions INTEGER DEFAULT 1000,
    
    -- Requirements & Status
    requirements_text TEXT NOT NULL,
    requirements_hash TEXT, -- SHA-256 string for on-chain integrity
    status SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1, 2)),
    image_url TEXT, -- Added for custom uploaded images
    rois JSONB, -- Array of objects {id, x, y, w, h, price, isSold}
    x_post_id TEXT, -- Added for Pinned Post X category
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_creator_wallet ON public.listings (creator_wallet);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings (status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings (item_category);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings (price);

-- 4. AUCTIONS (Bidding State synchronized from Solana PDA)
-- status: 0 = Active, 1 = Settled, 2 = Expired
CREATE TABLE IF NOT EXISTS public.auctions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    on_chain_address TEXT UNIQUE NOT NULL, -- Solana Auction PDA
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    starting_price BIGINT NOT NULL CHECK (starting_price >= 0),
    current_highest_bid BIGINT NOT NULL DEFAULT 0,
    current_bidder_wallet TEXT REFERENCES public.users(wallet_address),
    end_time TIMESTAMPTZ NOT NULL,
    status SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1, 2)),
    escrow_ata TEXT, -- Escrow SPL Token Account for USDC
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auctions_listing_id ON public.auctions (listing_id);
CREATE INDEX IF NOT EXISTS idx_auctions_end_time ON public.auctions (end_time);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON public.auctions (status);

-- 5. BIDS (Ledger of all bids & refund tracking)
CREATE TABLE IF NOT EXISTS public.bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    bidder_wallet TEXT NOT NULL REFERENCES public.users(wallet_address),
    amount BIGINT NOT NULL CHECK (amount > 0),
    tx_signature TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    refunded_at TIMESTAMPTZ -- NULL if active/winning; set when user executes pull-refund
);

CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON public.bids (auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder ON public.bids (bidder_wallet);

-- 6. CAMPAIGNS (Active sponsorship agreements locked in Solana Escrow)
-- status: 0 = Funded, 1 = Active, 2 = ProofSubmitted, 3 = Completed/Released, 4 = Disputed, 5 = Failed/Refunded
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    on_chain_address TEXT UNIQUE, -- Solana Campaign PDA
    listing_id UUID NOT NULL REFERENCES public.listings(id),
    creator_wallet TEXT NOT NULL REFERENCES public.users(wallet_address),
    advertiser_wallet TEXT NOT NULL REFERENCES public.users(wallet_address),
    
    amount BIGINT NOT NULL CHECK (amount > 0),
    fee_amount BIGINT NOT NULL DEFAULT 0, -- 5% fee calculated: amount * 500 / 10000
    ad_type SMALLINT NOT NULL,
    status SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1, 2, 3, 4, 5)),
    
    -- Proof of Execution
    proof_url TEXT, -- Image URL (Laptop sticker screenshot/photo, or X Tweet URL)
    proof_hash TEXT, -- SHA-256 hash verified on-chain
    proof_submitted_at TIMESTAMPTZ,
    
    -- Deadlines
    deadline TIMESTAMPTZ NOT NULL,        -- 48h default for creator to submit proof
    review_deadline TIMESTAMPTZ,         -- 24h default for advertiser to review / auto-release
    
    escrow_ata TEXT,
    tx_signature TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_creator ON public.campaigns (creator_wallet);
CREATE INDEX IF NOT EXISTS idx_campaigns_advertiser ON public.campaigns (advertiser_wallet);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns (status);

-- 7. DISPUTES
-- resolution: 0 = Pending, 1 = ReleasedToCreator, 2 = RefundedToAdvertiser
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    opened_by_wallet TEXT NOT NULL REFERENCES public.users(wallet_address),
    reason TEXT NOT NULL,
    resolved_by_admin TEXT,
    resolution SMALLINT DEFAULT 0 CHECK (resolution IN (0, 1, 2)),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_disputes_campaign_id ON public.disputes (campaign_id);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Public read access for marketplace discovery
CREATE POLICY "Allow public read on users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public read on active listings" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Allow public read on auctions" ON public.auctions FOR SELECT USING (true);
CREATE POLICY "Allow public read on bids" ON public.bids FOR SELECT USING (true);
CREATE POLICY "Allow participants read on campaigns" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Allow participants read on disputes" ON public.disputes FOR SELECT USING (true);

-- Authenticated write permissions (Wallet owners modify their own records)
CREATE POLICY "Allow user self-insert" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow user update profile" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Allow creator insert listing" ON public.listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow creator update own listing" ON public.listings FOR UPDATE USING (true);

CREATE POLICY "Allow bidder create bid" ON public.bids FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow advertiser create campaign" ON public.campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow campaign participant update" ON public.campaigns FOR UPDATE USING (true);

-- 9. BOUNTIES (Reverse Market for Creators)
CREATE TABLE IF NOT EXISTS public.bounties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    advertiser_wallet TEXT NOT NULL REFERENCES public.users(wallet_address) ON DELETE CASCADE,
    budget BIGINT NOT NULL CHECK (budget >= 0),
    requirements_text TEXT NOT NULL,
    status SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1, 2)), -- 0 = Open, 1 = In Progress, 2 = Closed
    applicants_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bounties_advertiser ON public.bounties (advertiser_wallet);
CREATE INDEX IF NOT EXISTS idx_bounties_status ON public.bounties (status);

ALTER TABLE public.bounties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on bounties" ON public.bounties FOR SELECT USING (true);
CREATE POLICY "Allow advertiser insert bounty" ON public.bounties FOR INSERT WITH CHECK (true);
