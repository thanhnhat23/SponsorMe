import { Listing, UserProfile, Campaign } from '@/types/database';

export const mockUsers: Record<string, UserProfile> = {
  'DevAlpha7x': {
    wallet_address: '7xK9...DevA',
    x_user_id: '12345678',
    x_username: 'alex_sol_dev',
    x_avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    x_follower_count: 8420,
    bio: 'Rust & Solana Core Dev. Attending Solana Breakpoint 2026 & Hackathon HCM. Coffee addict ☕',
    primary_role: 'creator',
    skills_or_tags: ['Solana', 'Rust', 'Web3', 'Senior Dev'],
    frequent_events: ['Solana Breakpoint', 'Hacker House SG', 'Vietnam Blockchain Week'],
    city: 'Ho Chi Minh City',
    reputation_score: 4.95,
    created_at: '2026-01-15T08:00:00Z',
  },
  'NomadGirl': {
    wallet_address: '8mP2...Noma',
    x_user_id: '87654321',
    x_username: 'elena_nomad',
    x_avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    x_follower_count: 14200,
    bio: 'Digital Nomad & UI Designer. Traveling through Tokyo, Bangkok, Da Nang with my Rimowa suitcase.',
    primary_role: 'creator',
    skills_or_tags: ['Design', 'Travel', 'Indie Hacker', 'Co-working'],
    frequent_events: ['Devcon Nomad Hub', 'Figma Config Hub'],
    city: 'Da Nang / Tokyo',
    reputation_score: 4.88,
    created_at: '2026-02-10T11:30:00Z',
  },
  'StudentHacker': {
    wallet_address: '3vT4...Stud',
    x_user_id: '56473829',
    x_username: 'khoa_uit_ai',
    x_avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    x_follower_count: 1850,
    bio: 'Senior CS Student @ UIT. Sitting at university library & The Coffee House Q1 daily.',
    primary_role: 'creator',
    skills_or_tags: ['AI/ML', 'Python', 'Student', 'Gen-Z'],
    frequent_events: ['AI Hackathon Vietnam', 'Google DevFest'],
    city: 'Ho Chi Minh City',
    reputation_score: 4.80,
    created_at: '2026-03-01T09:15:00Z',
  },
  'AdvertiserBrand': {
    wallet_address: '9wQ1...SaaS',
    x_user_id: '99887766',
    x_username: 'phantom_dex_xyz',
    x_avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    x_follower_count: 32000,
    bio: 'Next-gen Solana DEX Aggregator. Looking for authentic developer sponsorship.',
    primary_role: 'advertiser',
    skills_or_tags: ['DeFi', 'Solana', 'Brand'],
    frequent_events: ['Breakpoint', 'ETHDenver'],
    city: 'Singapore',
    reputation_score: 5.00,
    created_at: '2026-01-01T00:00:00Z',
  },
};

export const mockListings: Listing[] = [
  {
    id: 'list-001',
    on_chain_address: '9z8X...AuctionPDA1',
    creator_wallet: '7xK9...DevA',
    creator: mockUsers['DevAlpha7x'],
    ad_type: 2, // Physical Sticker
    listing_type: 1, // Auction
    price: 35, // starting bid $35
    item_category: 'laptop',
    device_or_item_name: 'Apple MacBook Pro 16" Space Black',
    placement_location: 'Nắp lưng trung tâm (Center Laptop Lid)',
    dimension_width_cm: 8.0,
    dimension_height_cm: 8.0,
    surface_area_cm2: 64.0,
    exposure_context: 'Mang laptop lên stage thuyết trình tại Vietnam Techfest 2026 & làm việc tại Dreamplex Q1.',
    target_niche: ['Developers', 'Web3', 'Founders', 'Tech Enthusiasts'],
    estimated_weekly_impressions: 4500,
    requirements_text: 'Sticker brand công nghệ/crypto, không chấp nhận nội dung 18+ hoặc cờ bạc. Cần gửi sticker chất lượng tốt.',
    status: 0,
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    rois: [{ x: 35, y: 40, w: 30, h: 20 }, { x: 70, y: 10, w: 15, h: 15 }],
    created_at: '2026-10-02T10:00:00Z',
    auction: {
      id: 'auc-001',
      on_chain_address: '9z8X...AuctionPDA1',
      listing_id: 'list-001',
      starting_price: 35,
      current_highest_bid: 45,
      current_bidder_wallet: '9wQ1...SaaS',
      end_time: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // 18 hours left
      status: 0,
      escrow_ata: 'EscrowATA_USDC_01',
      bids: [
        {
          id: 'bid-1',
          auction_id: 'auc-001',
          bidder_wallet: '4kL2...DevY',
          amount: 35,
          tx_signature: '5Ktp...bid1',
          created_at: '2026-10-02T12:00:00Z',
          refunded_at: '2026-10-02T14:30:00Z',
        },
        {
          id: 'bid-2',
          auction_id: 'auc-001',
          bidder_wallet: '9wQ1...SaaS',
          amount: 45,
          tx_signature: '4Wre...bid2',
          created_at: '2026-10-02T14:30:00Z',
        }
      ]
    }
  },
  {
    id: 'list-002',
    on_chain_address: '5a3B...FixedPDA2',
    creator_wallet: '8mP2...Noma',
    creator: mockUsers['NomadGirl'],
    ad_type: 2, // Physical Sticker
    listing_type: 0, // Fixed Price
    price: 25, // Fixed $25
    item_category: 'suitcase',
    device_or_item_name: 'Vali du lịch Rimowa Cabin Silver 21"',
    placement_location: 'Góc trên mặt trước vali (High visibility tại sân bay & ga tàu)',
    dimension_width_cm: 10.0,
    dimension_height_cm: 6.0,
    surface_area_cm2: 60.0,
    exposure_context: 'Di chuyển chặng bay Sài Gòn - Tokyo - Bangkok trong tháng 10. Xuất hiện tại 4 sân bay quốc tế và các co-working spaces.',
    target_niche: ['Digital Nomads', 'Travelers', 'SaaS', 'Remote Workers'],
    estimated_weekly_impressions: 8000,
    requirements_text: 'Sticker chống nước, logo rõ nét, hợp phong cách minimalism du lịch.',
    status: 0,
    image_url: 'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=800&auto=format&fit=crop&q=80',
    rois: [{ x: 20, y: 10, w: 60, h: 30 }],
    created_at: '2026-10-01T15:00:00Z',
  },
  {
    id: 'list-003',
    on_chain_address: '2cF1...FixedPDA3',
    creator_wallet: '3vT4...Stud',
    creator: mockUsers['StudentHacker'],
    ad_type: 2, // Physical Sticker
    listing_type: 0, // Fixed Price
    price: 10, // Siêu rẻ chỉ $10
    item_category: 'laptop',
    device_or_item_name: 'Dell XPS 15 Silver',
    placement_location: 'Góc dưới bên phải nắp máy (Bên cạnh logo Dell)',
    dimension_width_cm: 5.0,
    dimension_height_cm: 5.0,
    surface_area_cm2: 25.0,
    exposure_context: 'Ngồi học tại Giảng đường ĐHQG-HCM và các quán cafe sinh viên quận Thủ Đức & Quận 10 mỗi ngày 8 tiếng.',
    target_niche: ['Students', 'Junior Devs', 'AI Learners'],
    estimated_weekly_impressions: 2200,
    requirements_text: 'Chấp nhận mọi startup dev tools, edtech, crypto learning platform.',
    status: 0,
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    rois: [{ x: 65, y: 70, w: 25, h: 20 }],
    created_at: '2026-10-02T18:00:00Z',
  },
  {
    id: 'list-004',
    on_chain_address: '7uJ9...FixedPDA4',
    creator_wallet: '7xK9...DevA',
    creator: mockUsers['DevAlpha7x'],
    ad_type: 1, // Pinned Post X
    listing_type: 0, // Fixed Price
    price: 30, // $30 for 48h pinned post
    item_category: 'pinned_x',
    device_or_item_name: 'X (Twitter) Profile: @alex_sol_dev (8.4k Followers)',
    placement_location: 'Ghim bài trên đầu trang cá nhân trong 48 giờ',
    dimension_width_cm: 0,
    dimension_height_cm: 0,
    surface_area_cm2: 0,
    exposure_context: 'Tương tác trung bình 5k - 20k impressions mỗi tweet chuyên ngành Rust/Solana.',
    target_niche: ['Web3 Developers', 'Solana Ecosystem', 'Crypto Founders'],
    estimated_weekly_impressions: 15000,
    requirements_text: 'Nội dung tweet kỹ thuật, announcement dự án hoặc open-source library.',
    status: 0,
    image_url: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&auto=format&fit=crop&q=80',
    x_post_id: '1742918809983693156',
    created_at: '2026-10-03T08:00:00Z',
  },
  {
    id: 'list-005',
    on_chain_address: '8bM4...AuctionPDA5',
    creator_wallet: '8mP2...Noma',
    creator: mockUsers['NomadGirl'],
    ad_type: 2, // Physical Sticker
    listing_type: 1, // Auction
    price: 20, // Starting bid $20
    item_category: 'hoodie',
    device_or_item_name: 'Áo Hoodie Đen Oversize (Mặc tại Solana Hacker House)',
    placement_location: 'Ngực áo bên trái (Vị trí huy hiệu cực kỳ bắt mắt)',
    dimension_width_cm: 7.0,
    dimension_height_cm: 7.0,
    surface_area_cm2: 49.0,
    exposure_context: 'Mặc áo liên tục trong 4 ngày sự kiện Hacker House gặp gỡ 500+ developers.',
    target_niche: ['Developers', 'Web3', 'Fashion Tech'],
    estimated_weekly_impressions: 6000,
    requirements_text: 'Patch thêu hoặc in nhiệt logo, brand tech uy tín.',
    status: 0,
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    rois: [{ x: 60, y: 35, w: 15, h: 15 }],
    created_at: '2026-10-03T09:00:00Z',
    auction: {
      id: 'auc-005',
      on_chain_address: '8bM4...AuctionPDA5',
      listing_id: 'list-005',
      starting_price: 20,
      current_highest_bid: 28,
      current_bidder_wallet: '7xK9...DevA',
      end_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours left
      status: 0,
      escrow_ata: 'EscrowATA_USDC_05',
    }
  }
];

export const mockCampaigns: Campaign[] = [
  {
    id: 'camp-101',
    on_chain_address: '3rC1...CampaignPDA101',
    listing_id: 'list-001',
    listing: mockListings[0],
    creator_wallet: '7xK9...DevA',
    advertiser_wallet: '9wQ1...SaaS',
    amount: 45,
    fee_amount: 2.25, // 5% platform fee ($2.25 USDC)
    ad_type: 2,
    status: 2, // ProofSubmitted
    proof_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    proof_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    proof_submitted_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 44 * 60 * 60 * 1000).toISOString(),
    review_deadline: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    escrow_ata: 'EscrowATA_Campaign_101',
    tx_signature: '3Yut...proof1',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  }
];
