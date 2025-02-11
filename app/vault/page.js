'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import Image from 'next/image';

export default function VaultPage() {
  const [sneakers, setSneakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchVaultItems = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('vault_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching vault items:', error);
        return;
      }

      setSneakers(data || []);
      setLoading(false);
    };

    fetchVaultItems();
  }, [supabase]);

  const handleRemoveFromVault = async (sneakerId) => {
    const { error } = await supabase
      .from('vault_items')
      .delete()
      .eq('sneaker_id', sneakerId);

    if (error) {
      console.error('Error removing from vault:', error);
      alert('Failed to remove from vault. Please try again.');
      return;
    }

    setSneakers((prev) => prev.filter((s) => s.sneaker_id !== sneakerId));
    alert('Removed from vault successfully!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!sneakers.length) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Vault is Empty</h2>
        <p className="text-gray-600 mb-6">Start adding sneakers to your collection!</p>
        <Link
          href="/search"
          className="btn btn-primary"
        >
          Search Sneakers
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Vault</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sneakers.map((sneaker) => (
          <div
            key={sneaker.id}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
          >
            <figure className="relative px-4 pt-4">
              <div className="relative w-full h-56">
                {sneaker.thumbnail && (
                  <Image
                    src={sneaker.thumbnail}
                    alt={sneaker.name}
                    width={400}
                    height={400}
                    className="rounded-xl object-contain bg-gray-50 w-full h-full"
                    onError={(e) => {
                      console.error('Image load error:', e);
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            </figure>
            <div className="card-body pt-4">
              <h3 className="card-title text-lg font-bold line-clamp-2">{sneaker.name}</h3>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">{sneaker.brand}</p>
                <p className="text-lg font-semibold">${sneaker.retail_price || 'N/A'}</p>
              </div>
              <div className="card-actions justify-end mt-4">
                <Link
                  href={`/shoe/${sneaker.sneaker_id}`}
                  className="btn btn-outline btn-primary flex-1"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleRemoveFromVault(sneaker.sneaker_id)}
                  className="btn btn-ghost text-error"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 