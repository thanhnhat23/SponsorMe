use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Spons11111111111111111111111111111111111111");

pub const FEE_BPS_DEFAULT: u16 = 500; // 5%
pub const CAMPAIGN_DEADLINE_SECS: i64 = 48 * 3600; // 48h
pub const REVIEW_WINDOW_SECS: i64 = 24 * 3600; // 24h

#[program]
pub mod sponsorme {
    use super::*;

    /// 1. Initialize Program Config (Admin authority & platform fee ATA)
    pub fn initialize_config(ctx: Context<InitializeConfig>, fee_bps: u16) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.admin_authority = ctx.accounts.admin.key();
        config.platform_fee_ata = ctx.accounts.platform_fee_ata.key();
        config.fee_bps = fee_bps;
        config.bump = ctx.bumps.config;
        Ok(())
    }

    /// 2. Create Listing (Fixed price or starting auction price)
    pub fn create_listing(
        ctx: Context<CreateListing>,
        ad_type: u8,
        listing_type: u8,
        price: u64,
        requirements_hash: [u8; 32],
    ) -> Result<()> {
        require!(price > 0, SponsorError::InvalidPrice);
        let listing = &mut ctx.accounts.listing;
        listing.creator = ctx.accounts.creator.key();
        listing.ad_type = ad_type;
        listing.listing_type = listing_type;
        listing.price = price;
        listing.requirements_hash = requirements_hash;
        listing.status = 0; // Active
        listing.created_at = Clock::get()?.unix_timestamp;
        listing.bump = ctx.bumps.listing;
        Ok(())
    }

    /// 3. Buy Fixed Listing -> Locks USDC in Campaign Escrow
    pub fn buy_fixed_listing(ctx: Context<BuyFixedListing>) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        require!(listing.status == 0, SponsorError::ListingNotActive);
        require!(listing.listing_type == 0, SponsorError::NotFixedListing);

        let amount = listing.price;
        let fee_amount = (amount as u128 * ctx.accounts.config.fee_bps as u128 / 10000) as u64;

        // Transfer USDC from advertiser to campaign escrow ATA
        let cpi_accounts = Transfer {
            from: ctx.accounts.advertiser_token_account.to_account_info(),
            to: ctx.accounts.campaign_escrow_ata.to_account_info(),
            authority: ctx.accounts.advertiser.to_account_info(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
            amount,
        )?;

        // Init Campaign account
        let campaign = &mut ctx.accounts.campaign;
        let now = Clock::get()?.unix_timestamp;
        campaign.listing = listing.key();
        campaign.creator = listing.creator;
        campaign.advertiser = ctx.accounts.advertiser.key();
        campaign.amount = amount;
        campaign.fee_amount = fee_amount;
        campaign.ad_type = listing.ad_type;
        campaign.status = 1; // Active
        campaign.deadline = now + CAMPAIGN_DEADLINE_SECS;
        campaign.escrow_ata = ctx.accounts.campaign_escrow_ata.key();
        campaign.bump = ctx.bumps.campaign;

        listing.status = 1; // Sold/Closed
        Ok(())
    }

    /// 4. Create Auction linked to Listing
    pub fn create_auction(
        ctx: Context<CreateAuction>,
        duration_seconds: i64,
    ) -> Result<()> {
        let listing = &ctx.accounts.listing;
        require!(listing.listing_type == 1, SponsorError::NotAuctionListing);

        let auction = &mut ctx.accounts.auction;
        let now = Clock::get()?.unix_timestamp;
        auction.listing = listing.key();
        auction.seller = ctx.accounts.creator.key();
        auction.starting_price = listing.price;
        auction.current_highest_bid = listing.price;
        auction.current_bidder = Pubkey::default();
        auction.end_time = now + duration_seconds;
        auction.status = 0; // Active
        auction.escrow_ata = ctx.accounts.auction_escrow_ata.key();
        auction.bump = ctx.bumps.auction;
        Ok(())
    }

    /// 5. Place Bid (English Auction with 5% min increment & pull refund storage)
    pub fn place_bid(ctx: Context<PlaceBid>, amount: u64) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        let now = Clock::get()?.unix_timestamp;

        require!(auction.status == 0, SponsorError::AuctionNotActive);
        require!(now < auction.end_time, SponsorError::AuctionEnded);

        // 5% minimum increment: amount >= current * 105 / 100
        let min_bid = if auction.current_bidder == Pubkey::default() {
            auction.starting_price
        } else {
            auction.current_highest_bid.checked_mul(105).unwrap() / 100
        };
        require!(amount >= min_bid, SponsorError::BidTooLow);

        // Transfer USDC from bidder to auction escrow
        let cpi_accounts = Transfer {
            from: ctx.accounts.bidder_token_account.to_account_info(),
            to: ctx.accounts.auction_escrow_ata.to_account_info(),
            authority: ctx.accounts.bidder.to_account_info(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
            amount,
        )?;

        // If there was a previous bidder, record pending refund
        if auction.current_bidder != Pubkey::default() {
            let pending_refund = &mut ctx.accounts.pending_refund;
            pending_refund.auction = auction.key();
            pending_refund.bidder = auction.current_bidder;
            pending_refund.amount = auction.current_highest_bid;
            pending_refund.bump = ctx.bumps.pending_refund;
        }

        auction.current_highest_bid = amount;
        auction.current_bidder = ctx.accounts.bidder.key();
        Ok(())
    }

    /// 6. Claim Refund (Pull refund for outbid bidders)
    pub fn claim_refund(ctx: Context<ClaimRefund>) -> Result<()> {
        let refund = &ctx.accounts.pending_refund;
        require!(refund.amount > 0, SponsorError::NoRefundAvailable);
        require!(refund.bidder == ctx.accounts.bidder.key(), SponsorError::Unauthorized);

        let auction_key = ctx.accounts.auction.key();
        let seeds = &[
            b"auction_escrow".as_ref(),
            auction_key.as_ref(),
            &[ctx.accounts.auction.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.auction_escrow_ata.to_account_info(),
            to: ctx.accounts.bidder_token_account.to_account_info(),
            authority: ctx.accounts.auction.to_account_info(),
        };
        token::transfer(
            CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts, signer),
            refund.amount,
        )?;

        Ok(())
    }

    /// 7. Settle Auction -> Creates Campaign for winner
    pub fn settle_auction(ctx: Context<SettleAuction>) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        let now = Clock::get()?.unix_timestamp;
        require!(now >= auction.end_time, SponsorError::AuctionStillActive);
        require!(auction.status == 0, SponsorError::AuctionAlreadySettled);

        if auction.current_bidder == Pubkey::default() {
            auction.status = 2; // Expired
            return Ok(());
        }

        auction.status = 1; // Settled

        let campaign = &mut ctx.accounts.campaign;
        let fee_amount = (auction.current_highest_bid as u128 * ctx.accounts.config.fee_bps as u128 / 10000) as u64;
        campaign.listing = auction.listing;
        campaign.creator = auction.seller;
        campaign.advertiser = auction.current_bidder;
        campaign.amount = auction.current_highest_bid;
        campaign.fee_amount = fee_amount;
        campaign.status = 1; // Active
        campaign.deadline = now + CAMPAIGN_DEADLINE_SECS;
        campaign.bump = ctx.bumps.campaign;

        Ok(())
    }

    /// 8. Submit Proof (Creator submits hash of photo/post URL)
    pub fn submit_proof(ctx: Context<SubmitProof>, proof_hash: [u8; 32]) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        require!(campaign.creator == ctx.accounts.creator.key(), SponsorError::Unauthorized);
        require!(campaign.status == 1, SponsorError::InvalidCampaignStatus);

        let now = Clock::get()?.unix_timestamp;
        campaign.proof_hash = proof_hash;
        campaign.proof_submitted_at = now;
        campaign.review_deadline = now + REVIEW_WINDOW_SECS;
        campaign.status = 2; // ProofSubmitted
        Ok(())
    }

    /// 9. Confirm Delivery / Release Escrow (95% creator / 5% platform fee)
    pub fn confirm_delivery(ctx: Context<ConfirmDelivery>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        require!(campaign.advertiser == ctx.accounts.advertiser.key(), SponsorError::Unauthorized);
        require!(campaign.status == 2, SponsorError::ProofNotSubmitted);

        let creator_payout = campaign.amount.checked_sub(campaign.fee_amount).unwrap();
        let campaign_key = campaign.key();
        let seeds = &[
            b"campaign_escrow".as_ref(),
            campaign_key.as_ref(),
            &[campaign.bump],
        ];
        let signer = &[&seeds[..]];

        // Release 95% to Creator
        let cpi_creator = Transfer {
            from: ctx.accounts.campaign_escrow_ata.to_account_info(),
            to: ctx.accounts.creator_token_account.to_account_info(),
            authority: campaign.to_account_info(),
        };
        token::transfer(
            CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_creator, signer),
            creator_payout,
        )?;

        // Release 5% to Platform Fee ATA
        let cpi_platform = Transfer {
            from: ctx.accounts.campaign_escrow_ata.to_account_info(),
            to: ctx.accounts.platform_fee_ata.to_account_info(),
            authority: campaign.to_account_info(),
        };
        token::transfer(
            CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_platform, signer),
            campaign.fee_amount,
        )?;

        campaign.status = 3; // Completed
        Ok(())
    }

    /// 10. Open Dispute (Advertiser flags invalid proof)
    pub fn open_dispute(ctx: Context<OpenDispute>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        require!(campaign.advertiser == ctx.accounts.advertiser.key(), SponsorError::Unauthorized);
        require!(campaign.status == 2, SponsorError::ProofNotSubmitted);

        campaign.status = 4; // Disputed
        Ok(())
    }

    /// 11. Resolve Dispute (Admin authority only)
    pub fn resolve_dispute(ctx: Context<ResolveDispute>, release_to_creator: bool) -> Result<()> {
        let config = &ctx.accounts.config;
        require!(config.admin_authority == ctx.accounts.admin.key(), SponsorError::Unauthorized);

        let campaign = &mut ctx.accounts.campaign;
        require!(campaign.status == 4, SponsorError::InvalidCampaignStatus);

        let campaign_key = campaign.key();
        let seeds = &[
            b"campaign_escrow".as_ref(),
            campaign_key.as_ref(),
            &[campaign.bump],
        ];
        let signer = &[&seeds[..]];

        if release_to_creator {
            let creator_payout = campaign.amount.checked_sub(campaign.fee_amount).unwrap();
            let cpi_creator = Transfer {
                from: ctx.accounts.campaign_escrow_ata.to_account_info(),
                to: ctx.accounts.creator_token_account.to_account_info(),
                authority: campaign.to_account_info(),
            };
            token::transfer(
                CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_creator, signer),
                creator_payout,
            )?;
            campaign.status = 3;
        } else {
            // Full refund to advertiser
            let cpi_refund = Transfer {
                from: ctx.accounts.campaign_escrow_ata.to_account_info(),
                to: ctx.accounts.advertiser_token_account.to_account_info(),
                authority: campaign.to_account_info(),
            };
            token::transfer(
                CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_refund, signer),
                campaign.amount,
            )?;
            campaign.status = 5;
        }

        Ok(())
    }
}

// --------------------------------------------------------------------------
// ACCOUNTS & STRUCTS
// --------------------------------------------------------------------------

#[account]
pub struct ProgramConfig {
    pub admin_authority: Pubkey,
    pub platform_fee_ata: Pubkey,
    pub fee_bps: u16, // 500 = 5%
    pub bump: u8,
}

#[account]
pub struct Listing {
    pub creator: Pubkey,
    pub ad_type: u8,      // 0=SponsoredPost, 1=PinnedPost, 2=Banner/Sticker
    pub listing_type: u8, // 0=Fixed, 1=Auction
    pub price: u64,
    pub requirements_hash: [u8; 32],
    pub status: u8,       // 0=Active, 1=Sold, 2=Cancelled
    pub created_at: i64,
    pub bump: u8,
}

#[account]
pub struct Auction {
    pub listing: Pubkey,
    pub seller: Pubkey,
    pub starting_price: u64,
    pub current_highest_bid: u64,
    pub current_bidder: Pubkey,
    pub end_time: i64,
    pub status: u8, // 0=Active, 1=Settled, 2=Expired
    pub escrow_ata: Pubkey,
    pub bump: u8,
}

#[account]
pub struct PendingRefund {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub amount: u64,
    pub bump: u8,
}

#[account]
pub struct Campaign {
    pub listing: Pubkey,
    pub creator: Pubkey,
    pub advertiser: Pubkey,
    pub amount: u64,
    pub fee_amount: u64,
    pub ad_type: u8,
    pub status: u8, // 0=Funded, 1=Active, 2=ProofSubmitted, 3=Completed, 4=Disputed, 5=Failed
    pub proof_hash: [u8; 32],
    pub proof_submitted_at: i64,
    pub deadline: i64,
    pub review_deadline: i64,
    pub escrow_ata: Pubkey,
    pub bump: u8,
}

// --------------------------------------------------------------------------
// CONTEXTS
// --------------------------------------------------------------------------

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 32 + 2 + 1,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, ProgramConfig>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub platform_fee_ata: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateListing<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 1 + 1 + 8 + 32 + 1 + 8 + 1,
        seeds = [b"listing", creator.key().as_ref(), &Clock::get().unwrap().unix_timestamp.to_le_bytes()],
        bump
    )]
    pub listing: Account<'info, Listing>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyFixedListing<'info> {
    #[account(mut)]
    pub listing: Account<'info, Listing>,
    #[account(
        init,
        payer = advertiser,
        space = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 1 + 32 + 8 + 8 + 8 + 32 + 1,
        seeds = [b"campaign", listing.key().as_ref()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub advertiser: Signer<'info>,
    #[account(mut)]
    pub advertiser_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub campaign_escrow_ata: Account<'info, TokenAccount>,
    pub config: Account<'info, ProgramConfig>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateAuction<'info> {
    pub listing: Account<'info, Listing>,
    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 32 + 8 + 8 + 32 + 8 + 1 + 32 + 1,
        seeds = [b"auction", listing.key().as_ref()],
        bump
    )]
    pub auction: Account<'info, Auction>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub auction_escrow_ata: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBid<'info> {
    #[account(mut)]
    pub auction: Account<'info, Auction>,
    #[account(
        init_if_needed,
        payer = bidder,
        space = 8 + 32 + 32 + 8 + 1,
        seeds = [b"refund", auction.key().as_ref(), auction.current_bidder.as_ref()],
        bump
    )]
    pub pending_refund: Account<'info, PendingRefund>,
    #[account(mut)]
    pub bidder: Signer<'info>,
    #[account(mut)]
    pub bidder_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub auction_escrow_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimRefund<'info> {
    #[account(mut)]
    pub auction: Account<'info, Auction>,
    #[account(
        mut,
        close = bidder,
        seeds = [b"refund", auction.key().as_ref(), bidder.key().as_ref()],
        bump = pending_refund.bump
    )]
    pub pending_refund: Account<'info, PendingRefund>,
    #[account(mut)]
    pub bidder: Signer<'info>,
    #[account(mut)]
    pub bidder_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub auction_escrow_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SettleAuction<'info> {
    #[account(mut)]
    pub auction: Account<'info, Auction>,
    #[account(
        init,
        payer = settler,
        space = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 1 + 32 + 8 + 8 + 8 + 32 + 1,
        seeds = [b"campaign", auction.listing.as_ref()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub settler: Signer<'info>,
    pub config: Account<'info, ProgramConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitProof<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    pub creator: Signer<'info>,
}

#[derive(Accounts)]
pub struct ConfirmDelivery<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    pub advertiser: Signer<'info>,
    #[account(mut)]
    pub campaign_escrow_ata: Account<'info, TokenAccount>,
    #[account(mut)]
    pub creator_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub platform_fee_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct OpenDispute<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    pub advertiser: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    pub admin: Signer<'info>,
    pub config: Account<'info, ProgramConfig>,
    #[account(mut)]
    pub campaign_escrow_ata: Account<'info, TokenAccount>,
    #[account(mut)]
    pub creator_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub advertiser_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

// --------------------------------------------------------------------------
// ERRORS
// --------------------------------------------------------------------------

#[error_code]
pub enum SponsorError {
    #[msg("Invalid price specified")]
    InvalidPrice,
    #[msg("Listing is not active")]
    ListingNotActive,
    #[msg("Listing is not a fixed price listing")]
    NotFixedListing,
    #[msg("Listing is not an auction listing")]
    NotAuctionListing,
    #[msg("Auction is not active")]
    AuctionNotActive,
    #[msg("Auction has already ended")]
    AuctionEnded,
    #[msg("Bid must be at least 5% higher than the current highest bid")]
    BidTooLow,
    #[msg("No refund available for caller")]
    NoRefundAvailable,
    #[msg("Auction is still active")]
    AuctionStillActive,
    #[msg("Auction is already settled")]
    AuctionAlreadySettled,
    #[msg("Caller is unauthorized for this action")]
    Unauthorized,
    #[msg("Invalid campaign status")]
    InvalidCampaignStatus,
    #[msg("Proof has not been submitted yet")]
    ProofNotSubmitted,
}
