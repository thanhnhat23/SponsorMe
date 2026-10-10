export type AdType = 0 | 1 | 2; // 0=SponsoredPost, 1=PinnedPost, 2=PhysicalSticker/Banner
export type ListingType = 0 | 1; // 0=Fixed, 1=Auction
export type ListingStatus = 0 | 1 | 2; // 0=Active, 1=Sold/Closed, 2=Cancelled
export type AuctionStatus = 0 | 1 | 2; // 0=Active, 1=Settled, 2=Expired
export type CampaignStatus = 
  | 0 // Funded
  | 1 // Active
  | 2 // ProofSubmitted
  | 3 // Completed/PaymentReleased
  | 4 // Disputed
  | 5 // Failed/Refunded;

export type ItemCategory = 
  | 'laptop' 
  | 'suitcase' 
  | 'hoodie' 
  | 'backpack' 
  | 'pinned_x' 
  | 'x_bio' 
  | 'combo'
  | 'other';

export interface UserProfile {
  wallet_address: string;
  x_user_id?: string;
  x_username?: string;
  x_avatar_url?: string;
  x_follower_count?: number;
  bio?: string;
  primary_role: 'creator' | 'advertiser' | 'both' | 'admin';
  skills_or_tags: string[];
  frequent_events: string[];
  city: string;
  reputation_score: number;
  created_at: string;
}

export interface Listing {
  id: string;
  on_chain_address?: string;
  creator_wallet: string;
  creator?: UserProfile;
  ad_type: AdType;
  listing_type: ListingType;
  price: number; // in USD (or USDC decimals)
  item_category: ItemCategory;
  device_or_item_name: string;
  placement_location: string;
  dimension_width_cm?: number;
  dimension_height_cm?: number;
  surface_area_cm2?: number;
  exposure_context: string;
  target_niche: string[];
  estimated_weekly_impressions: number;
  requirements_text: string;
  requirements_hash?: string;
  status: ListingStatus;
  image_url?: string;
  x_post_id?: string;
  rois?: Array<{ id?: string; x: number; y: number; w: number; h: number; price?: number; isSold?: boolean }>;
  created_at: string;
  auction?: Auction;
}

export interface Auction {
  id: string;
  on_chain_address: string;
  listing_id: string;
  starting_price: number;
  current_highest_bid: number;
  current_bidder_wallet?: string;
  end_time: string; // ISO String
  status: AuctionStatus;
  escrow_ata?: string;
  bids?: Bid[];
}

export interface Bid {
  id: string;
  auction_id: string;
  bidder_wallet: string;
  amount: number;
  tx_signature: string;
  created_at: string;
  refunded_at?: string | null;
}

export interface Campaign {
  id: string;
  on_chain_address?: string;
  listing_id: string;
  listing?: Listing;
  creator_wallet: string;
  advertiser_wallet: string;
  amount: number;
  fee_amount: number; // 5% fee
  ad_type: AdType;
  status: CampaignStatus;
  proof_url?: string;
  proof_hash?: string;
  proof_submitted_at?: string;
  deadline: string; // 48h default
  review_deadline?: string; // 24h default
  escrow_ata?: string;
  tx_signature?: string;
  created_at: string;
}

export interface Dispute {
  id: string;
  campaign_id: string;
  opened_by_wallet: string;
  reason: string;
  resolved_by_admin?: string;
  resolution: 0 | 1 | 2; // 0=Pending, 1=ReleasedToCreator, 2=RefundedToAdvertiser
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export interface Bounty {
  id: string;
  title: string;
  advertiser_wallet: string;
  advertiser?: UserProfile;
  budget: number;
  requirements_text: string;
  status: number;
  applicants_count: number;
  created_at: string;
}
