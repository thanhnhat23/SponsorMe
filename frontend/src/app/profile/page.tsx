'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Header } from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { useWallet } from '@solana/wallet-adapter-react';

export default function ProfilePage() {
  const wallet = useWallet();
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [tags, setTags] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Fetch profile when wallet changes
  useEffect(() => {
    async function fetchProfile() {
      if (!wallet.publicKey) return;
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', wallet.publicKey.toBase58())
        .single();
      
      if (data) {
        setUsername(data.x_username || '');
        setBio(data.bio || '');
        setCity(data.city || '');
        setTags(data.skills_or_tags ? data.skills_or_tags.join(', ') : '');
        setAvatarUrl(data.x_avatar_url || '');
      }
    }
    fetchProfile();
  }, [wallet.publicKey]);

  const handleSave = async () => {
    if (!wallet.publicKey) {
      alert("Please connect your wallet first.");
      return;
    }
    setIsSaving(true);
    
    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    
    const { error } = await supabase.from('users').upsert({
      wallet_address: wallet.publicKey.toBase58(),
      x_username: username,
      bio: bio,
      city: city,
      skills_or_tags: tagsArray,
      x_avatar_url: avatarUrl,
      primary_role: 'creator' // default
    }, { onConflict: 'wallet_address' });

    setIsSaving(false);
    if (error) {
      console.error(error);
      alert('Error updating profile: ' + error.message);
    } else {
      alert('Profile updated successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 selection:text-white font-sans overflow-x-hidden">
      <Header
        walletState={{ isConnected: wallet.connected, publicKey: wallet.publicKey?.toBase58() || null, walletName: null, solBalance: 0, usdcBalance: 0, network: 'devnet', rpcUrl: '' }}
        onOpenConnectModal={() => {}}
        onDisconnectWallet={() => wallet.disconnect()}
        openCreateModal={() => {}}
        openCampaignsModal={() => {}}
        openBountiesModal={() => {}}
        onToggleThesis={() => {}}
      />
      
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8 border-b border-white/10 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Your Profile</h1>
          <p className="text-zinc-400 text-sm">Manage your personal information and creator identity.</p>
        </div>

        <div className="space-y-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border border-white/20">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-zinc-900 text-white text-2xl">CR</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white">Profile Avatar</h3>
              <p className="text-xs text-zinc-500">Must be a valid image URL.</p>
              <Input 
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="bg-zinc-950 border-white/20 text-white text-xs rounded-lg max-w-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Username / X Handle:</label>
              <Input 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-zinc-950 border-white/20 text-white text-xs rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Bio / Tagline:</label>
              <Input 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="bg-zinc-950 border-white/20 text-white text-xs rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">City / Location:</label>
                <Input 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-zinc-950 border-white/20 text-white text-xs rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Skills or Tags (comma separated):</label>
                <Input 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. AI, Web3, Design"
                  className="bg-zinc-950 border-white/20 text-white text-xs rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-white hover:bg-zinc-200 text-black font-bold px-8 rounded-lg"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
