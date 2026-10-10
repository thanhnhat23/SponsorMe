import { ActionGetResponse, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS } from '@solana/actions';
import { PublicKey, SystemProgram, Transaction, Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { NextResponse } from 'next/server';

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  const payload: ActionGetResponse = {
    title: `SponsorMe Listing ${id}`,
    icon: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    description: 'Sponsor this creator instantly from your X feed using Solana Actions!',
    label: 'Buy Now',
    links: {
      actions: [
        {
          label: 'Buy for $15 (0.1 SOL)',
          href: `/api/actions/buy?id=${id}&amount=0.1`,
        },
      ],
    },
  };

  return NextResponse.json(payload, { headers: ACTIONS_CORS_HEADERS });
};

export const POST = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const amountParam = url.searchParams.get('amount') || '0.1';
    
    const body: ActionPostRequest = await req.json();
    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid account' }, { status: 400, headers: ACTIONS_CORS_HEADERS });
    }

    const connection = new Connection(clusterApiUrl('devnet'));

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: new PublicKey('Spons11111111111111111111111111111111111111'), // Escrow Address
        lamports: parseFloat(amountParam) * LAMPORTS_PER_SOL,
      })
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = account;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    const payload: ActionPostResponse = {
      transaction: transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
      message: `Funded Escrow with ${amountParam} SOL`,
    };

    return NextResponse.json(payload, { headers: ACTIONS_CORS_HEADERS });
  } catch (err) {
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 400, headers: ACTIONS_CORS_HEADERS });
  }
};

export const OPTIONS = GET;
