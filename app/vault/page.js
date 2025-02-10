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
      return;
    }

    setSneakers((prev) => prev.filter((s) => s.sneaker_id !== sneakerId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
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
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Search Sneakers
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Vault</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sneakers.map((sneaker) => (
          <div
            key={sneaker.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <Image
                src={sneaker.image_url}
                alt={sneaker.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{sneaker.name}</h3>
              <p className="text-gray-600 mb-4">${sneaker.retail_price}</p>
              <div className="flex justify-between items-center">
                <Link
                  href={`/shoe/${sneaker.sneaker_id}`}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleRemoveFromVault(sneaker.sneaker_id)}
                  className="text-red-600 hover:text-red-800 font-medium"
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