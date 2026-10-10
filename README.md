# SponsorMe

**SponsorMe** is a decentralized micro-sponsorship protocol built on **Solana**. It bridges the gap between individual creators (builders, developers, influencers) and advertisers (startups, crypto projects, brands) by turning everyday items into monetizable ad space.

Whether it's a physical sticker on a MacBook lid at a tech conference, a logo on a Rimowa suitcase, or a digital Pinned Tweet on X, SponsorMe makes micro-sponsorships trustless, transparent, and frictionless.

## 🚀 How It Works

SponsorMe operates as a two-sided marketplace secured by on-chain escrow.

### For Creators (Sellers)
1. **List Your Space:** Creators upload photos of their available ad space (e.g., laptop lid, t-shirt, X bio) and draw specific spots (Regions of Interest) where stickers or logos can be placed.
2. **Set the Rules:** Choose to sell the space at a **Fixed Price (Buy Now)** or launch an **English Auction** to let the market decide the value.
3. **Fulfill & Get Paid:** Once an advertiser purchases the spot, the creator places the ad, snaps a photo as proof, and submits it. The proof's SHA-256 hash is anchored on the Solana blockchain. Upon verification, the escrow automatically releases **95% of the funds** directly to the creator's wallet.

### For Advertisers (Buyers)
1. **Discover Placements:** Browse curated, high-visibility physical and digital placements based on target niches (e.g., #Dev, #Web3, #Students) and estimated impressions.
2. **Secure Escrow Payment:** Purchase a specific spot or place a bid. Funds (USDC/SOL) are securely locked in a **Solana Escrow PDA** (Program Derived Address). 
3. **Verify Delivery:** Review the submitted proof of work from the creator. If everything looks good, release the funds. If the creator fails to deliver, the advertiser can open a **Dispute** to reclaim their locked funds.
4. **Bounty Board (Reverse Market):** Have a specific budget and requirement? Advertisers can post a Bounty, and interested creators will apply directly to the campaign.

## ⚡ Key Features
- **Solana Escrow Protocol:** All transactions are trustless. Funds are held on-chain (Devnet) until the creator delivers the promised exposure.
- **Micro-Auctions & Fixed Pricing:** Flexible monetization models tailored for micro-influencers and indie developers.
- **On-chain Proof of Delivery:** Proof images are hashed and stored on-chain, ensuring immutable records of delivery.
- **Two-Way Rating System:** After a successful campaign, both parties leave 1-5 star reviews to build long-term on-chain reputation.
- **Fair Fee Structure:** The platform takes a minimal 5% protocol fee, ensuring creators take home the lion's share (95%).

## 🛠 Tech Stack
- **Frontend:** Next.js, Tailwind CSS, shadcn/ui
- **Backend/Database:** Supabase (PostgreSQL, Row-Level Security)
- **Web3:** `@solana/web3.js`, `@solana/wallet-adapter-react` (Currently running on Solana Devnet)

---
*Built for the creators, builders, and the decentralized future.*
